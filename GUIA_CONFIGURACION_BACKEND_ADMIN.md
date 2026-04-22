# Guía Maestra de Configuración y Gestión: Backend Admin Terabound v4

Este informe detalla el procedimiento paso a paso para configurar y gestionar el ecosistema Terabound desde el **Backend Admin**. El objetivo es establecer un entorno multi-tenant robusto y vinculado correctamente con las micro-apps.

---

## 1. El Flujo Lógico de Configuración
Para que el sistema funcione correctamente, se debe seguir este orden estricto de operaciones:
1.  **Registro de Módulos (Plataforma Global)**
2.  **Configuración de Infraestructura (Control Plane)**
3.  **Creación del Tenant (Inquilino)**
4.  **Activación de Módulos para el Tenant**
5.  **Configuración de Seguridad (Roles y Permisos)**
6.  **Gestión de Usuarios y Membresías**
7.  **Construcción de Menús y Navegación**

---

## 2. Paso a Paso Detallado

### Paso 1: Registro de Módulos (`_gl_modules`)
Antes de que un tenant pueda usar una aplicación (como el CRM), esta debe existir en el registro global.
*   **Acción:** Ir a `Plataforma > Módulos`.
*   **Configuración:**
    *   **Slug:** Debe coincidir con la carpeta en `apps/` (ej: `crm`).
    *   **Tipo:** Identificar si es `core`, `micro-app` o `system`.
    *   **Firebase App ID:** El ID único de la app en la consola de Firebase.
    *   **Visibilidad:** Marcar como `tenant-available` para que los clientes puedan activarlo.

### Paso 2: Creación de un Tenant (`tenants/`)
Un tenant es un espacio de trabajo aislado (una empresa cliente).
*   **Acción:** Ir a `Tenants > Nuevo Tenant`.
*   **Configuración:**
    *   **Owner User ID:** Es el UID de Firebase del usuario que será el administrador principal de esa empresa.
    *   **Configuración Regional:** Definir moneda, zona horaria e idioma (esto afecta a todas las micro-apps vinculadas).
*   **Resultado:** Se crea un documento en la colección raíz `tenants/` con un ID único.

### Paso 3: Activación de Módulos del Tenant (`_tn_modules`)
Una vez creado el tenant, debes decidir qué aplicaciones tiene contratadas.
*   **Acción:** Dentro de la ficha del Tenant, ir a `Módulos`.
*   **Configuración:** Activar los módulos deseados. 
*   **Impacto:** Esto crea una entrada en `tenants/{tenantId}/_tn_modules/`. El HUB solo mostrará estas apps al usuario.

### Paso 4: Gestión de Roles y Permisos (`_tn_roles`)
El sistema utiliza **RBAC (Role Based Access Control)**.
*   **Acción:** Ir a `Seguridad > Roles`.
*   **Configuración:**
    *   Crear roles (ej: "Gerente de Ventas", "Operador").
    *   **Matriz de Permisos:** Para cada entidad (ej: `crm_leads`), definir si el rol puede: `Create`, `Read`, `Update`, `Delete`, `Approve`, `Export`.
*   **Ubicación:** Estos roles viven dentro del tenant: `tenants/{tenantId}/_tn_roles/`.

### Paso 5: Gestión de Usuarios y Membresías (`members`)
Vincular personas reales con el tenant y asignarles un rol.
*   **Acción:** Ir a `Seguridad > Membresías`.
*   **Configuración:**
    *   Asociar un `userId` (global) con el `tenantId`.
    *   Asignar el `roleId` creado en el paso anterior.
*   **Resultado:** El usuario ahora tiene permiso para "entrar" en esa empresa.

### Paso 6: Menu Builder y Navegación (`_gl_navigation`)
Define qué ve el usuario en su barra lateral.
*   **Acción:** Ir a `UI > Navegación`.
*   **Configuración:**
    *   Crear items de menú vinculados a slugs de módulos.
    *   **Visibilidad:** Se puede filtrar qué items ve cada rol.
*   **Dinamismo:** El sistema permite hacer "Overrides" por tenant si una empresa necesita un menú personalizado.

---

## 3. Vinculación con las Micro-Apps

### ¿Cómo se "hablan" las apps?
Las micro-apps (CRM, Finanzas, etc.) son agnósticas a la configuración global. Su comunicación se basa en el **Contexto de Sesión**:

1.  **El HUB resuelve el contexto:** Cuando el usuario elige una empresa, el HUB guarda el `tenantId` en una cookie segura.
2.  **La Micro-App lee el contexto:** Al abrirse el CRM, este consulta al HUB (o al paquete `@terabound/auth`) para saber:
    *   ¿En qué `tenantId` estoy trabajando?
    *   ¿Qué permisos tiene mi `roleId` para mis colecciones (ej: `crm_leads`)?
3.  **Inyección de Filtros:** Todas las queries a Firestore que hace la micro-app incluyen automáticamente el filtro `.where('tenantId', '==', activeTenantId)`.

### Comunicación de Base de Datos
*   **Colecciones de Módulo:** Cada micro-app escribe en sus propias colecciones dentro del path del tenant: `tenants/{tenantId}/crm_leads/...`.
*   **Eventos:** Si el CRM necesita avisar a Finanzas de una venta, emite un evento en `tenants/{tenantId}/_tn_event_log`. Un proceso de Firebase Functions puede reaccionar a este evento.

---

## 4. Checklist de Configuración para una Nueva App
Si vas a crear una nueva micro-app (ej: `mod-inventario`), este es el checklist en el Backend:
1.  [ ] **Registrar Módulo:** Crear el slug `inventario` en el registro global.
2.  [ ] **Definir Entidades:** Registrar en `Data Governance` las entidades (ej: `inv_productos`).
3.  [ ] **Crear Permisos:** Ir al Role Builder y añadir la nueva entidad a los roles existentes.
4.  [ ] **Añadir al Menú:** Crear el link en el Navigation Builder apuntando a la URL de la nueva app.
5.  [ ] **Activar en Tenants:** Entrar a los clientes que compraron el módulo y activarlo.

---
**Elaborado por:** Antigravity AI
**Enfoque:** Control de Plataforma y Gobierno Multi-tenant
