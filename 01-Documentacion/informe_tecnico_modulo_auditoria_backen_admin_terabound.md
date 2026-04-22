# 📘 INFORME TÉCNICO DE IMPLEMENTACIÓN
## Módulo: Auditoría & Event System
### Backend Admin — Terabound ERP Modular Multi-tenant

---

## 1. PROPÓSITO

Definir de forma **ejecutable, estricta y sin ambigüedad** la implementación del módulo de **Auditoría y Eventos** del Backen Admin.

Este módulo es responsable de:

- Garantizar trazabilidad completa del sistema
- Centralizar eventos críticos de plataforma
- Soportar auditoría de seguridad, soporte e incidentes
- Servir como base para cumplimiento, debugging y análisis

⚠️ Este módulo **NO es un sistema de logs técnico ni observabilidad**.
Es un **sistema de auditoría gobernado**.

---

## 2. ALCANCE

### Incluye

- Registro de eventos auditables (_gl_audit_log)
- Catálogo de eventos (_gl_event_catalog)
- Event log por tenant (_tn_event_log)
- Visualización, filtros y export
- Integración con IAM, Platform, Tenant, Navigation, Governance y Operations

### No incluye

- Logging técnico (errores → _gl_errors)
- Monitoreo de sistema
- Métricas (→ analytics)
- Observabilidad distribuida

---

## 3. PRINCIPIOS ARQUITECTÓNICOS

1. **Auditoría obligatoria por diseño**
2. **Event-driven (todo cambio relevante genera evento)**
3. **Separación estricta de dominios**
4. **Multi-tenant estricto**
5. **Escritura solo server-side**
6. **No almacenamiento de datos sensibles**
7. **Gobernado (no libre ni interpretativo)**

---

## 4. MODELO DE DATOS

### 4.1 `_gl_audit_log/{eventId}`

```ts
{
  tenantId?: string
  moduleId?: string

  eventType: string
  entityType: string
  entityId: string

  actorUserId: string
  actorType: 'user' | 'system' | 'support'

  action: string

  before?: Record<string, unknown>
  after?: Record<string, unknown>

  metadata?: Record<string, unknown>

  severity: 'info' | 'warning' | 'critical'

  status: 'success' | 'failure'
  errorCode?: string

  correlationId?: string
  source: 'ui' | 'function' | 'system' | 'support'

  createdAt: Timestamp
}
```

---

### 4.2 `_gl_event_catalog/{eventType}`

```ts
{
  domain: string
  version: number
  severity: 'info' | 'warning' | 'critical'
  retentionDays: number
  active: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

### 4.3 `tenants/{tenantId}/_tn_event_log/{eventId}`

```ts
{
  eventType: string
  moduleId?: string
  entityType: string
  entityId: string
  actorUserId: string
  payload?: Record<string, unknown>
  createdAt: Timestamp
}
```

---

## 5. REGLAS CRÍTICAS DE IMPLEMENTACIÓN

### 5.1 Escritura de auditoría

- ❌ Prohibido escribir desde frontend
- ✅ Solo mediante Cloud Functions / server actions
- ❌ No permitir escritura directa por Firestore Rules

---

### 5.2 Datos sensibles

Prohibido almacenar:

- contraseñas
- tokens
- API keys
- datos sensibles sin masking

Regla:

- usar allowlist de campos auditables
- no guardar documentos completos

---

### 5.3 Before / After

- Solo incluir campos relevantes
- Limitar tamaño del payload
- Evitar dumps completos

---

### 5.4 Separación de sistemas

| Sistema | Colección |
|--------|----------|
| Auditoría | _gl_audit_log |
| Eventos tenant | _tn_event_log |
| Errores | _gl_errors |
| Jobs | _gl_jobs |
| Incidentes | _gl_incidents |

---

## 6. EVENTOS OBLIGATORIOS

### IAM
- UserInvited
- UserActivated
- UserBlocked
- MembershipGranted
- MembershipRevoked
- RoleCreated
- RoleUpdated
- RoleDeleted
- PermissionChanged

### Platform
- ModuleRegistered
- ModuleStatusChanged
- FeatureFlagChanged
- EnvironmentConfigChanged
- ReleasePublished

### Tenant
- TenantCreated
- TenantUpdated
- TenantSuspended
- TenantModuleEnabled
- TenantModuleDisabled

### Navigation
- NavigationSchemaChanged
- NavigationItemChanged
- NavigationOverrideApplied

### Governance
- EntityDefinitionChanged
- RelationshipChanged
- ValidationRuleChanged
- CatalogChanged
- CatalogItemChanged

### Operations
- JobQueued
- JobFailed
- IncidentOpened
- IncidentResolved
- SupportSessionStarted
- SupportSessionEnded

---

## 7. PERMISOS

- audit.logs.read
- audit.logs.export
- audit.events.read

Restricción:

- acceso limitado por tenant y scope
- PlatformAdmin acceso global

---

## 8. ÍNDICES OBLIGATORIOS

- tenantId + createdAt desc
- moduleId + createdAt desc
- entityType + entityId + createdAt desc
- actorUserId + createdAt desc
- eventType + createdAt desc
- tenantId + severity + createdAt desc

---

## 9. RETENCIÓN DE DATOS

- Definida por `_gl_event_catalog.retentionDays`
- Job programado de limpieza
- Export previo obligatorio si aplica compliance

---

## 10. EXPORTACIÓN

- formatos: CSV / JSON
- límite temporal obligatorio
- export debe generar evento auditado

---

## 11. INTEGRACIÓN CON OTROS MÓDULOS

### IAM
- auditoría de usuarios, roles y memberships

### Operations
- vinculación con jobs, errores e incidentes

### Support
- sesiones de soporte auditadas

### Governance
- cambios estructurales auditados

---

## 12. UI (BACKEN ADMIN)

### `/admin/audit/log`

- filtros avanzados
- diff before/after
- export

### `/admin/audit/events`

- catálogo de eventos
- severidad
- retención

---

## 13. SEEDS OBLIGATORIOS

Script: `audit-seed.ts`

Debe crear:

- catálogo de eventos base
- severidades
- retención por dominio

Condiciones:

- idempotente
- ejecución manual
- no runtime

---

## 14. RESTRICCIONES NO NEGOCIABLES (ANTIGRAVITY)

1. No reinterpretar modelo `_gl_audit_log`
2. No escribir auditoría desde cliente
3. No mezclar con logs técnicos
4. No almacenar datos sensibles
5. Toda acción crítica debe generar evento
6. Toda exportación debe ser auditada
7. Respetar multi-tenant estricto
8. No generar lógica de negocio en auditoría

---

## 15. DEFINITION OF DONE

✔ Auditoría activa en todos los dominios
✔ Eventos obligatorios implementados
✔ Escritura solo server-side
✔ UI funcional con filtros y export
✔ Índices implementados
✔ Retención funcionando
✔ Seeds ejecutados
✔ Sin fuga de datos sensibles

---

## 16. RESULTADO ESPERADO

El sistema debe permitir:

- Trazabilidad completa
- Auditoría de seguridad
- Soporte avanzado
- Análisis de eventos
- Cumplimiento y gobernanza

Sin generar:

- deuda técnica
- acoplamiento indebido
- fugas de información

---

## 17. NOTA FINAL

Este documento es normativo.

Si Antigravity se desvía:
→ la implementación debe considerarse incorrecta.

