# Informe Técnico Completo: Ecosistema Terabound v4

## 1. Introducción y Visión General
Terabound v4 es un ERP modular, multi-tenant y escalable diseñado para operar sobre la infraestructura de **Firebase**. El sistema se organiza bajo una arquitectura de **Monorepo** utilizando **Turborepo**, lo que permite gestionar múltiples aplicaciones y paquetes compartidos de forma eficiente.

### Principios Arquitectónicos
*   **Multi-tenant Estricto:** Aislamiento total de datos mediante `tenantId`.
*   **Modularidad:** Cada funcionalidad de negocio (CRM, Finanzas, etc.) reside en su propia aplicación independiente.
*   **Repository Pattern:** Desacoplamiento de la lógica de datos de la implementación de Firebase.
*   **SSO Centralizado:** Autenticación única a través del módulo HUB.
*   **Single Source of Truth:** El Backend Admin centraliza la configuración global.

---

## 2. Tecnologías Core
*   **Framework:** Next.js 15+ (App Router)
*   **Lenguaje:** TypeScript (Modo Estricto)
*   **Interfaz de Usuario:** React 19, Tailwind CSS, Lucide React.
*   **Backend as a Service:** Firebase (Auth, Firestore, Functions, Hosting).
*   **Gestión de Monorepo:** Turborepo.

---

## 3. Estructura de Aplicaciones (`apps/`)

### 3.1 Backend Admin (`apps/backend`)
Es el **Cerebro del Ecosistema** o "Control Plane". Su función principal no es el negocio, sino el gobierno de la plataforma.

**Funcionalidades Clave:**
*   **Platform Control Plane:** Gestión de variables globales, módulos registrados y feature flags.
*   **Tenant Management:** Alta, suspensión y configuración de inquilinos (branding, límites).
*   **IAM & Security:** Motor de roles (RBAC) y gestión de membresías de usuarios.
*   **Navigation Builder:** Definición dinámica de menús y navegación para todo el ecosistema.
*   **Data Governance:** Definición de entidades, relaciones y reglas de validación.
*   **Audit System:** Registro global de eventos y trazabilidad de acciones.

### 3.2 Hub (`apps/hub`)
Es la **Puerta de Entrada** para los usuarios finales.

**Funcionalidades Clave:**
*   **Autenticación:** Login único mediante Firebase Auth.
*   **Resolución de Tenant:** Identificación del tenant al que pertenece el usuario.
*   **Bootstrap de Contexto:** Carga de permisos, módulos habilitados y configuración del usuario.
*   **Enrutamiento:** Redirección inteligente hacia los módulos de negocio.

---

## 4. Paquetes Compartidos (`packages/`)
El código reutilizable se organiza en paquetes para garantizar la consistencia entre aplicaciones:

*   **`@terabound/domain`:** Contratos, interfaces y entidades de negocio.
*   **`@terabound/ui`:** Componentes de interfaz (Design System "Industrial Dark").
*   **`@terabound/firebase-client`:** Configuración y clientes de Firebase (Singleton).
*   **`@terabound/repositories`:** Implementación del patrón repositorio para acceso a datos.
*   **`@terabound/auth`:** Lógica compartida de autenticación y guardias.
*   **`@terabound/config`:** Gestión de variables de entorno y configuración compartida.
*   **`@terabound/application`:** Casos de uso y lógica de orquestación.

---

## 5. Modelo de Datos (Firestore)

### Colecciones Globales (Prefijo `_gl_`)
*   `_gl_platform_config`: Configuración técnica de la plataforma.
*   `_gl_modules`: Registro maestro de módulos disponibles.
*   `_gl_audit_log`: Auditoría de nivel plataforma.
*   `_gl_catalogs`: Datos maestros globales (países, monedas, etc.).

### Estructura Multi-tenant
*   `tenants/{tenantId}`: Información del inquilino.
*   `tenants/{tenantId}/members`: Usuarios asociados al tenant.
*   `tenants/{tenantId}/_tn_roles`: Roles personalizados por tenant.
*   `tenants/{tenantId}/_tn_modules`: Módulos activos para el tenant específico.
*   `tenants/{tenantId}/[modulo]_{entidad}`: Datos específicos de cada módulo (ej: `crm_leads`).

---

## 6. Guía de Uso y Desarrollo

### Ejecución Local
Para iniciar el entorno de desarrollo completo:
```bash
npm run dev
```
Esto levantará el Backend Admin en el puerto `3000` y el HUB en el puerto `3001`.

### Flujo de Trabajo
1.  **Definición en Backend:** Cualquier nuevo módulo o permiso debe registrarse primero en el Backend Admin.
2.  **Desarrollo Modular:** Crear una nueva carpeta en `apps/mod-[nombre]` siguiendo el patrón de Next.js.
3.  **Uso de Repositorios:** No realizar llamadas directas a `getDoc` o `addDoc` desde los componentes; usar las interfaces de `packages/repositories`.

---

## 7. Análisis de Documentación Adicional (`01-Documentacion`)
Los archivos en esta carpeta proporcionan el nivel de detalle necesario para la implementación técnica:

*   **Master Blueprint:** Detalla la responsabilidad de cada submódulo del Backend.
*   **Master Plan:** Establece las fases de implementación (desde el Backbone hasta el Hardening).
*   **Seguridad IAM:** Requerimientos específicos para el cierre de brechas de seguridad y gestión de identidades.
*   **Auditoría:** Planes detallados para la trazabilidad total de operaciones.

---
**Elaborado por:** Antigravity AI
**Fecha:** 22 de Abril de 2026
