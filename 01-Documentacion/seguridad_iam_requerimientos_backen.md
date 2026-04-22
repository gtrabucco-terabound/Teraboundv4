# Seguridad (IAM) — Requerimientos Técnicos del Backen Admin
## Terabound ERP Modular Multi-tenant

---

## 1. Propósito

Definir de forma **inequívoca y ejecutable** el alcance, responsabilidades y reglas del módulo de **Seguridad (IAM)** dentro del Backen Admin, evitando ambigüedades en la implementación.

Este documento es **normativo** y debe ser seguido por cualquier agente de desarrollo (ej. Antigravity).

---

## 2. Referencias (OBLIGATORIO)

Este documento extiende y NO contradice:
- Master Plan de Implementación
- Backen Admin — Master Blueprint
- Backen Admin — Especificación Técnica Ejecutable

En caso de conflicto:
1. Especificación Técnica Ejecutable
2. Este documento
3. Blueprint
4. Master Plan

---

## 3. Decisión Arquitectónica CRÍTICA

### Gestión de usuarios — Política oficial

**El Backen NO es el sistema de gestión operativa de usuarios de los tenants.**

El Backen:
- gobierna identidad y acceso
- administra usuarios de plataforma
- crea SOLO usuarios iniciales de tenant

El tenant:
- administra sus usuarios internos
- gestiona altas/bajas operativas
- controla accesos dentro de sus módulos

---

## 4. Clasificación de usuarios

### 4.1 Usuarios de Plataforma

Gestionados EXCLUSIVAMENTE en Backen.

Tipos:
- PlatformAdmin
- SecurityAdmin
- SupportOperator
- ReadOnlyAuditor

Ubicación:
- `users/{userId}`

Permisos:
- acceso a `/admin`
- permisos `platform.*`

---

### 4.2 Usuarios Administradores de Tenant (Seed Users)

Creados durante el alta de tenant.

Incluyen:
- Owner
- TenantAdmin inicial

Origen:
- flujo de creación de tenant (UI existente)

Reglas:
- debe existir al menos un Owner
- se crea membership automáticamente
- se asigna rol inicial

---

### 4.3 Usuarios Operativos del Tenant

NO gestionados desde Backen.

Responsabilidad:
- tenant

Canales:
- Hub
- panel tenant
- módulos funcionales

---

## 5. Alcance del módulo Seguridad (Backen)

### 5.1 Users

#### Funcionalidad
- listar usuarios globales
- ver detalle
- cambiar estado
- bloquear / desbloquear
- ver actividad

#### NO permitido
- alta masiva de usuarios tenant

#### Campos clave
- status
- globalType
- lastLoginAt

---

### 5.2 Memberships

#### Funcionalidad
- vista transversal usuario ↔ tenant
- auditoría de accesos
- revocación de acceso
- revisión de roles asignados

#### Uso principal
- soporte
- auditoría
- seguridad

---

### 5.3 Roles

#### Tipos
- globales
- tenant-scoped

#### Funcionalidad
- creación
- clonación
- herencia
- matriz de permisos
- scopes

#### Regla
Backen define el sistema, tenant lo usa.

---

### 5.4 Políticas

#### Funcionalidad
- MFA
- expiración de sesión
- restricciones
- políticas de soporte

#### Scope
- plataforma

---

## 6. Flujo oficial: creación de tenant

### Paso 1
Crear tenant

### Paso 2
Solicitar Owner (ya implementado ✔️)

### Paso 3
Crear user (si no existe)

### Paso 4
Crear membership

### Paso 5
Asignar rol (Owner / TenantAdmin)

### Paso 6
Habilitar módulos

---

## 7. Permisos críticos

### Users
- `platform.users.read`
- `platform.users.manage`

### Memberships
- `tenant.memberships.read`
- `tenant.memberships.manage`

### Roles
- `tenant.roles.manage`

### Policies
- `platform.policies.manage`

---

## 8. Reglas de seguridad obligatorias

- prohibido crear usuarios tenant desde Backen
- prohibido asignar permisos fuera del catálogo
- prohibido elevar privilegios manualmente
- auditoría obligatoria en cambios críticos
- no eliminar usuarios con dependencias activas

---

## 9. Auditoría obligatoria

Eventos mínimos:
- UserBlocked
- UserActivated
- MembershipGranted
- MembershipRevoked
- RoleAssigned
- RoleChanged
- PolicyChanged

---

## 10. Casos de uso permitidos

### Sí
- crear PlatformAdmin
- bloquear usuario
- invitar owner de tenant
- auditar accesos

### No
- crear empleados de una empresa
- gestionar RRHH desde Backen
- operar onboarding de clientes

---

## 11. Integración con otros módulos

### Tenants
- crea owner
- define contexto inicial

### Hub
- gestiona usuarios operativos

### Módulos
- consumen permisos

---

## 12. Definition of Done

El módulo Seguridad está completo cuando:

- users funciona con estados
- memberships auditable
- roles configurables
- policies activas
- separación plataforma/tenant respetada
- auditoría implementada

---

## 13. Regla final

Si el Backen empieza a gestionar usuarios operativos de tenants:
→ la arquitectura está incorrecta

Si el Backen gobierna identidad y delega operación:
→ la arquitectura es correcta

---

## 14. Nota para implementación (Antigravity)

No inventar flujos de creación de usuarios fuera de este documento.

Respetar:
- separación de dominios
- ownership de datos
- límites del Backen

Cualquier desviación debe ser validada explícitamente.

