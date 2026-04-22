# Seguridad (IAM) — Plan de Cierre de Implementación (Gap Closure)
## Backen Admin · Terabound ERP Modular Multi-tenant

---

## 1. Propósito

Este documento define de forma **ejecutable y sin ambigüedad** las tareas faltantes para dejar el módulo de **Seguridad (IAM)** completamente operativo en el Backen Admin, en continuidad con:

- `seguridad_iam_requerimientos_backen`
- Backen Admin — Especificación Técnica Ejecutable

Este documento **NO redefine arquitectura**. Solo cierra brechas (gaps) detectadas tras la implementación actual.

---

## 2. Estado actual (resumen validado)

Implementado:
- Repositorios (Users, Memberships, Roles, Policies)
- UI base de 4 pantallas
- Alta de Owner en creación de tenant
- Persistencia de roles y matriz de permisos

Brechas detectadas:
1. Reglas de creación de usuarios no formalizadas
2. Memberships sin acciones operativas completas
3. Ambigüedad roles globales vs tenant
4. Policies sin seed mínimo
5. Auditoría no garantizada en todas las acciones
6. Falta de restricciones duras en backend (no solo UI)

---

## 3. Regla madre (NO VIOLAR)

> El Backen gobierna identidad. El tenant gestiona usuarios operativos.

---

## 4. GAP 1 — Creación de Usuarios

### Problema
No está formalizado qué usuarios se pueden crear desde `/admin/security/users`.

### Decisión obligatoria

Solo se permite crear:
- PlatformAdmin
- SecurityAdmin
- SupportOperator
- ReadOnlyAuditor

NO se permite:
- crear usuarios operativos de tenant

### Implementación

#### Backend
Validación obligatoria:

```ts
if (input.globalType === 'tenant_user') throw new Error('Not allowed')
```

#### UI
- Botón "Crear usuario" solo visible para `platform.users.manage`
- Selector de tipo restringido a tipos plataforma

#### Nota Antigravity
NO generar flujo genérico de alta de usuarios.

---

## 5. GAP 2 — Memberships Operativos

### Problema
Vista actual es solo auditoría.

### Requerido
Agregar acciones:
- Revocar acceso
- Cambiar rol
- Ver detalle completo

### Campos obligatorios en tabla
- userId
- tenantId
- roleId
- status
- createdAt
- updatedAt

### Implementación

#### Backend
- método `revokeMembership()`
- método `changeRole()`

#### UI
- botón "Revocar"
- selector de rol inline

---

## 6. GAP 3 — Modelo de Roles

### Problema
Ambigüedad entre roles globales y tenant.

### Decisión

Separación estricta:

#### Roles de plataforma
- colección: `_gl_roles`
- uso: Backen

#### Roles de tenant
- colección: `tenants/{tenantId}/_tn_roles`
- uso: apps

### Regla
Backen NO debe aplicar roles globales dentro de tenants directamente.

### Implementación

- flag `scope: 'platform' | 'tenant'`
- validación en repositorio

---

## 7. GAP 4 — Security Policies Seed

### Problema
Sistema vacío en producción.

### Requerido
Crear seed automático:

```json
{
  "mfaRequiredForPlatformAdmin": true,
  "sessionTimeoutMinutes": 60,
  "maxLoginAttempts": 5
}
```

### Implementación

- ejecutar al iniciar sistema si colección vacía

---

## 8. GAP 5 — Auditoría obligatoria

### Problema
No garantizada en todas las acciones.

### Eventos mínimos

- UserCreated
- UserBlocked
- UserActivated
- MembershipGranted
- MembershipRevoked
- RoleCreated
- RoleUpdated
- PolicyChanged

### Implementación

Cada repositorio debe emitir evento.

---

## 9. GAP 6 — Reglas de seguridad backend

### Problema
Validaciones pueden estar solo en UI.

### Requerido

#### Firestore Rules
- bloquear escritura directa a roles sin permiso
- bloquear creación de usuarios tenant

#### Backend
- validar permisos antes de cada acción

---

## 10. Validación final (Definition of Done extendido)

El módulo está completo cuando:

- Users solo crea usuarios plataforma
- Memberships permite revocar y modificar
- Roles separados por scope
- Policies con seed activo
- Auditoría en todas las acciones críticas
- Reglas backend aplicadas (no solo UI)

---

## 11. Instrucciones para Antigravity

1. NO redefinir arquitectura
2. NO agregar CRUD de usuarios tenant
3. implementar gaps en orden 1→6
4. validar cada paso contra `seguridad_iam_requerimientos_backen`

---

## 12. Resultado esperado

- IAM completamente gobernado desde Backen
- tenants autónomos en operación
- seguridad consistente y auditable
- sin necesidad de refactor posterior

---

## 13. Nota final

Este documento es complementario. Si hay conflicto:

1. Especificación Técnica Ejecutable
2. seguridad_iam_requerimientos_backen
3. este documento

