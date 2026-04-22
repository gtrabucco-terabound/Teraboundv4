# BACKEN ADMIN — ESPECIFICACIÓN TÉCNICA EJECUTABLE
## Terabound ERP Modular Multi-tenant

---

## 1. OBJETIVO

Definir la especificación técnica ejecutable del **Backen Admin** para que pueda desarrollarse sin ambigüedad y sirva como base sólida para el Hub y para todas las micro apps futuras.

El Backen es:
- fuente de verdad de plataforma
- motor de gobierno multi-tenant
- núcleo IAM/RBAC
- administrador de navegación
- gestor de catálogos maestros
- motor de auditoría y eventos
- centro de operaciones y soporte
- orquestador declarativo de configuración

---

## 2. ALCANCE

Este documento cubre exclusivamente el módulo **`apps/backend`**.

No incluye lógica funcional de CRM, Finanzas, Work Orders, Logística & Inventarios ni RRHH, salvo sus dependencias de gobierno, permisos, navegación, catálogos o habilitación.

---

## 3. DECISIONES ARQUITECTÓNICAS FIJAS

### 3.1 Monorepo
```text
apps/
  backend/
  hub/
  mod-crm/
  mod-finanzas/
  mod-work-orders/
  mod-logistica-inventarios/
  mod-rrhh/
packages/
  domain/
  repositories/
  firebase-client/
  auth/
  ui/
  config/
functions/
```

### 3.2 Stack
- Next.js App Router
- TypeScript estricto
- Firebase Auth
- Firestore
- Cloud Functions
- App Check
- Tailwind + sistema UI compartido

### 3.3 Principios
- `tenantId` obligatorio en toda entidad tenant-scoped
- Backen controla, no ejecuta lógica de negocio de módulos
- ningún módulo define roles, permisos o menús globales
- toda operación sensible deja auditoría
- todo acceso debe pasar por resolución de contexto
- todo módulo se habilita desde Backen

---

## 4. DOMINIOS DEL BACKEN

1. Platform Control Plane
2. Tenant Management
3. IAM & Security
4. Navigation & Menu Builder
5. Master Data Management
6. Data Governance
7. Audit & Event System
8. Operations & Support
9. Automation Engine
10. Analytics & Insights

---

## 5. MODELO DE DATOS — COLECCIONES Y CAMPOS

## 5.1 Globales

### `users/{userId}`
```ts
{
  email: string
  displayName: string
  photoURL?: string
  phoneNumber?: string
  status: 'invited' | 'active' | 'blocked' | 'disabled'
  globalType: 'platform_admin' | 'standard'
  lastLoginAt?: Timestamp
  lastSeenAt?: Timestamp
  createdAt: Timestamp
  createdBy: string
  updatedAt: Timestamp
  updatedBy: string
  deletedAt?: Timestamp
}
```
Índices:
- `status + email`
- `globalType + status`

### `_gl_platform_config/firebase_shared`
```ts
{
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appCheckSiteKey?: string
  defaultRegion?: string
  updatedAt: Timestamp
  updatedBy: string
  version: number
}
```

### `_gl_modules/{moduleId}`
```ts
{
  slug: string
  name: string
  description?: string
  category: 'core' | 'micro-app' | 'system'
  type: 'backend' | 'hub' | 'crm' | 'finanzas' | 'work-orders' | 'logistica-inventarios' | 'rrhh'
  firebaseAppId: string
  remoteUrl?: string
  icon?: string
  status: 'active' | 'maintenance' | 'deprecated' | 'draft'
  visibility: 'internal' | 'tenant-available'
  dependencies: string[]
  sortOrder: number
  version: string
  createdAt: Timestamp
  createdBy: string
  updatedAt: Timestamp
  updatedBy: string
}
```
Índices:
- `status + sortOrder`
- `visibility + status`

### `_gl_feature_flags/{flagId}`
```ts
{
  key: string
  name: string
  description?: string
  enabled: boolean
  scope: 'platform' | 'tenant' | 'module'
  targetModules?: string[]
  targetTenants?: string[]
  rolloutPercentage?: number
  createdAt: Timestamp
  createdBy: string
  updatedAt: Timestamp
  updatedBy: string
}
```

### `_gl_environments/{envId}`
```ts
{
  name: 'dev' | 'staging' | 'prod'
  status: 'active' | 'inactive'
  configVersion: number
  notes?: string
  updatedAt: Timestamp
  updatedBy: string
}
```

### `_gl_releases/{releaseId}`
```ts
{
  name: string
  version: string
  targetModules: string[]
  status: 'planned' | 'in-progress' | 'released' | 'rolled-back'
  releasedAt?: Timestamp
  notes?: string
  createdAt: Timestamp
  createdBy: string
}
```

### `_gl_security_policies/{policyId}`
```ts
{
  key: string
  name: string
  description?: string
  type: 'auth' | 'session' | 'network' | 'support'
  enabled: boolean
  config: Record<string, unknown>
  updatedAt: Timestamp
  updatedBy: string
}
```

### `_gl_navigation/{navId}`
```ts
{
  key: string
  name: string
  type: 'sidebar' | 'topbar' | 'hub-launcher' | 'admin'
  active: boolean
  createdAt: Timestamp
  createdBy: string
  updatedAt: Timestamp
  updatedBy: string
}
```

### `_gl_navigation_items/{itemId}`
```ts
{
  navId: string
  parentId?: string
  label: string
  icon?: string
  route: string
  moduleId?: string
  requiredPermissions: string[]
  requiredModules?: string[]
  visibility: 'always' | 'module-enabled' | 'role-based'
  badgeType?: 'none' | 'info' | 'warning' | 'error'
  sortOrder: number
  active: boolean
  createdAt: Timestamp
  createdBy: string
  updatedAt: Timestamp
  updatedBy: string
}
```
Índices:
- `navId + parentId + sortOrder`
- `moduleId + active`

### `_gl_catalogs/{catalogId}`
```ts
{
  key: string
  name: string
  scope: 'global' | 'tenant-overridable'
  active: boolean
  itemSchema?: Record<string, unknown>
  createdAt: Timestamp
  createdBy: string
  updatedAt: Timestamp
  updatedBy: string
}
```

### `_gl_catalog_items/{itemId}`
```ts
{
  catalogId: string
  key: string
  label: string
  value: string
  metadata?: Record<string, unknown>
  sortOrder: number
  active: boolean
  createdAt: Timestamp
  createdBy: string
  updatedAt: Timestamp
  updatedBy: string
}
```
Índices:
- `catalogId + active + sortOrder`

### `_gl_entities/{entityId}`
```ts
{
  key: string
  name: string
  moduleId?: string
  scope: 'global' | 'tenant'
  storagePath: string
  primaryIdField: string
  displayField?: string
  auditable: boolean
  softDelete: boolean
  active: boolean
  createdAt: Timestamp
  createdBy: string
  updatedAt: Timestamp
  updatedBy: string
}
```

### `_gl_relationships/{relationId}`
```ts
{
  key: string
  name: string
  sourceEntityKey: string
  targetEntityKey: string
  cardinality: '1:1' | '1:N' | 'N:N'
  required: boolean
  crossModule: boolean
  strategy: 'reference' | 'projection' | 'event-driven'
  cascadePolicy: 'none' | 'restrict' | 'soft-delete'
  active: boolean
  createdAt: Timestamp
  createdBy: string
  updatedAt: Timestamp
  updatedBy: string
}
```

### `_gl_validation_rules/{ruleId}`
```ts
{
  entityKey: string
  name: string
  type: 'required' | 'enum' | 'format' | 'custom'
  field: string
  config: Record<string, unknown>
  active: boolean
  updatedAt: Timestamp
  updatedBy: string
}
```

### `_gl_reference_models/{modelId}`
```ts
{
  key: string
  name: string
  entityKeys: string[]
  strategy: 'shared-master' | 'lookup' | 'projection'
  active: boolean
  updatedAt: Timestamp
  updatedBy: string
}
```

### `_gl_event_catalog/{eventType}`
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

### `_gl_audit_log/{eventId}`
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
  createdAt: Timestamp
}
```
Índices:
- `tenantId + createdAt desc`
- `moduleId + createdAt desc`
- `entityType + entityId + createdAt desc`
- `actorUserId + createdAt desc`

### `_gl_jobs/{jobId}`
```ts
{
  type: string
  scope: 'platform' | 'tenant' | 'module'
  tenantId?: string
  moduleId?: string
  status: 'queued' | 'running' | 'failed' | 'completed' | 'cancelled'
  payload?: Record<string, unknown>
  result?: Record<string, unknown>
  error?: string
  createdAt: Timestamp
  startedAt?: Timestamp
  finishedAt?: Timestamp
  createdBy: string
}
```

### `_gl_errors/{errorId}`
```ts
{
  source: 'frontend' | 'function' | 'integration'
  moduleId?: string
  tenantId?: string
  code: string
  message: string
  stack?: string
  severity: 'warning' | 'error' | 'critical'
  status: 'open' | 'ack' | 'resolved'
  createdAt: Timestamp
  resolvedAt?: Timestamp
}
```

### `_gl_incidents/{incidentId}`
```ts
{
  title: string
  description?: string
  severity: 'minor' | 'major' | 'critical'
  status: 'open' | 'investigating' | 'resolved'
  moduleIds?: string[]
  tenantIds?: string[]
  createdAt: Timestamp
  createdBy: string
  resolvedAt?: Timestamp
}
```

### `_gl_automation_rules/{ruleId}`
```ts
{
  key: string
  name: string
  description?: string
  triggerEvent: string
  conditions: Record<string, unknown>[]
  actions: Record<string, unknown>[]
  active: boolean
  createdAt: Timestamp
  createdBy: string
  updatedAt: Timestamp
  updatedBy: string
}
```

### `_gl_metrics/{metricId}`
```ts
{
  key: string
  scope: 'platform' | 'tenant' | 'module'
  tenantId?: string
  moduleId?: string
  value: number
  unit?: string
  measuredAt: Timestamp
}
```

---

## 5.2 Tenant-scoped

### `tenants/{tenantId}`
```ts
{
  legalName: string
  tradeName?: string
  taxId?: string
  status: 'active' | 'suspended' | 'draft' | 'archived'
  timezone: string
  locale: string
  currency: string
  country?: string
  ownerUserId: string
  planId?: string
  branding?: {
    logoUrl?: string
    primaryColor?: string
    secondaryColor?: string
  }
  createdAt: Timestamp
  createdBy: string
  updatedAt: Timestamp
  updatedBy: string
  deletedAt?: Timestamp
}
```
Índices:
- `status + legalName`
- `ownerUserId + status`

### `tenants/{tenantId}/members/{membershipId}`
```ts
{
  userId: string
  roleId: string
  status: 'invited' | 'active' | 'blocked' | 'revoked'
  moduleAccess: string[]
  departmentId?: string
  invitedBy: string
  invitedAt?: Timestamp
  activatedAt?: Timestamp
  lastAccessAt?: Timestamp
  createdAt: Timestamp
  createdBy: string
  updatedAt: Timestamp
  updatedBy: string
}
```
Índices:
- `userId + status`
- `roleId + status`

### `tenants/{tenantId}/_tn_roles/{roleId}`
```ts
{
  key: string
  name: string
  description?: string
  isSystem: boolean
  inherits?: string[]
  permissions: string[]
  scopes: Record<string, 'own' | 'team' | 'department' | 'tenant' | 'platform'>
  active: boolean
  createdAt: Timestamp
  createdBy: string
  updatedAt: Timestamp
  updatedBy: string
}
```

### `tenants/{tenantId}/_tn_modules/{moduleId}`
```ts
{
  moduleId: string
  status: 'enabled' | 'disabled' | 'maintenance'
  enabledAt?: Timestamp
  config?: Record<string, unknown>
  limits?: Record<string, number>
  updatedAt: Timestamp
  updatedBy: string
}
```

### `tenants/{tenantId}/_tn_settings/{settingId}`
```ts
{
  key: string
  value: unknown
  type: 'string' | 'number' | 'boolean' | 'json'
  category?: string
  updatedAt: Timestamp
  updatedBy: string
}
```

### `tenants/{tenantId}/_tn_navigation_overrides/{overrideId}`
```ts
{
  itemId: string
  action: 'hide' | 'rename' | 'reorder'
  value: unknown
  updatedAt: Timestamp
  updatedBy: string
}
```

### `tenants/{tenantId}/_tn_event_log/{eventId}`
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

## 6. RELACIONES MAESTRAS

- `users.userId` ↔ `tenants/{tenantId}/members.userId`
- `members.roleId` ↔ `tenants/{tenantId}/_tn_roles.roleId`
- `tenants/{tenantId}/_tn_modules.moduleId` ↔ `_gl_modules.moduleId`
- `_gl_navigation_items.moduleId` ↔ `_gl_modules.moduleId`
- `_gl_relationships.sourceEntityKey` ↔ `_gl_entities.key`
- `_gl_relationships.targetEntityKey` ↔ `_gl_entities.key`
- `_gl_catalog_items.catalogId` ↔ `_gl_catalogs.catalogId`

Regla: las relaciones entre módulos nunca se resuelven mediante lecturas directas arbitrarias; se resuelven por referencia estable, proyección o eventos.

---

## 7. MATRIZ DE PERMISOS DEL BACKEN

## 7.1 Convención
Formato de permiso:
```text
<dominio>.<recurso>.<acción>
```

Ejemplos:
- `platform.modules.read`
- `platform.modules.manage`
- `tenant.users.invite`
- `tenant.roles.manage`
- `navigation.menus.manage`
- `audit.logs.read`

## 7.2 Acciones base
- `read`
- `create`
- `update`
- `delete`
- `manage`
- `approve`
- `export`
- `assign`
- `close`
- `support`

## 7.3 Scope
- `own`
- `team`
- `department`
- `tenant`
- `platform`

## 7.4 Permisos obligatorios

### Platform
- `platform.config.read`
- `platform.config.manage`
- `platform.modules.read`
- `platform.modules.manage`
- `platform.features.read`
- `platform.features.manage`
- `platform.environments.read`
- `platform.environments.manage`
- `platform.releases.read`
- `platform.releases.manage`

### Tenant
- `tenant.directory.read`
- `tenant.directory.manage`
- `tenant.modules.read`
- `tenant.modules.manage`
- `tenant.settings.read`
- `tenant.settings.manage`

### Users & Memberships
- `tenant.users.read`
- `tenant.users.invite`
- `tenant.users.update`
- `tenant.users.block`
- `tenant.memberships.read`
- `tenant.memberships.manage`

### Roles & Permissions
- `tenant.roles.read`
- `tenant.roles.create`
- `tenant.roles.update`
- `tenant.roles.delete`
- `tenant.roles.manage`
- `tenant.permissions.read`
- `tenant.permissions.manage`

### Navigation
- `navigation.schemas.read`
- `navigation.schemas.manage`
- `navigation.menus.read`
- `navigation.menus.manage`

### Master Data
- `master.catalogs.read`
- `master.catalogs.manage`

### Data Governance
- `data.entities.read`
- `data.entities.manage`
- `data.relationships.read`
- `data.relationships.manage`
- `data.validation.read`
- `data.validation.manage`

### Audit
- `audit.logs.read`
- `audit.logs.export`
- `audit.events.read`

### Operations
- `ops.jobs.read`
- `ops.jobs.manage`
- `ops.errors.read`
- `ops.errors.manage`
- `ops.incidents.read`
- `ops.incidents.manage`
- `ops.support.impersonate`

### Automation
- `automation.rules.read`
- `automation.rules.manage`

### Analytics
- `analytics.platform.read`
- `analytics.usage.read`

---

## 8. ROLES SISTEMA RECOMENDADOS

### PlatformAdmin
- alcance `platform`
- acceso total a Backen

### TenantAdmin
- alcance `tenant`
- administra tenant, usuarios, roles, módulos habilitados y configuración tenant-scoped
- no administra config global de plataforma

### SecurityAdmin
- acceso a users, roles, memberships, audit y policies

### SupportOperator
- acceso a jobs, errors, incidents, audit y soporte auditado

### ReadOnlyAuditor
- solo lectura de auditoría, eventos, analytics y configuración

---

## 9. SECURITY RULES — PRINCIPIOS EJECUTABLES

## 9.1 Contexto obligatorio
Toda request debe resolver:
- `request.auth != null`
- `userId`
- `tenantId` cuando el recurso sea tenant-scoped
- permisos efectivos

## 9.2 Estrategia
- Firestore Rules validan acceso mínimo y pertenencia
- lógica compleja de negocio va en Functions
- operaciones críticas del Backen se hacen mediante server actions / functions

## 9.3 Reglas por dominio

### Globales
Lectura y escritura solo para `PlatformAdmin`, salvo `users/{userId}` lectura parcial del propio perfil.

### Tenant-scoped
Un usuario solo puede leer/escribir dentro de tenants donde tiene membership activa.

### Roles
Solo `tenant.roles.manage` o `PlatformAdmin`.

### Navigation global
Solo `PlatformAdmin`.

### Audit log
Solo lectura para perfiles con `audit.logs.read`. Escritura solo sistema/functions.

### Jobs / Errors / Incidents
Lectura para operadores autorizados. Escritura preferentemente solo functions.

## 9.4 Constraints obligatorios en rules
- impedir modificación de `createdAt` y `createdBy`
- requerir `updatedAt` y `updatedBy` en updates
- validar enums críticos
- impedir cambiar `tenantId`
- impedir elevación de privilegios por escritura directa

---

## 10. ÍNDICES OBLIGATORIOS

Crear en `firestore.indexes.json` como mínimo:
- `_gl_modules(status, sortOrder)`
- `_gl_navigation_items(navId, parentId, sortOrder)`
- `_gl_catalog_items(catalogId, active, sortOrder)`
- `_gl_audit_log(tenantId, createdAt desc)`
- `_gl_audit_log(moduleId, createdAt desc)`
- `_gl_audit_log(entityType, entityId, createdAt desc)`
- `tenants(status, legalName)`
- `tenants(ownerUserId, status)`
- `members(userId, status)` por subcolección group si aplica
- `members(roleId, status)` por subcolección group si aplica

---

## 11. EVENTOS OBLIGATORIOS

## 11.1 IAM
- `UserInvited`
- `UserActivated`
- `UserBlocked`
- `MembershipGranted`
- `MembershipRevoked`
- `RoleCreated`
- `RoleUpdated`
- `RoleDeleted`
- `PermissionChanged`

## 11.2 Platform
- `ModuleRegistered`
- `ModuleStatusChanged`
- `FeatureFlagChanged`
- `EnvironmentConfigChanged`
- `ReleasePublished`

## 11.3 Tenant
- `TenantCreated`
- `TenantUpdated`
- `TenantSuspended`
- `TenantModuleEnabled`
- `TenantModuleDisabled`

## 11.4 Navigation
- `NavigationSchemaChanged`
- `NavigationItemChanged`
- `NavigationOverrideApplied`

## 11.5 Governance
- `EntityDefinitionChanged`
- `RelationshipChanged`
- `ValidationRuleChanged`
- `CatalogChanged`
- `CatalogItemChanged`

## 11.6 Operations
- `JobQueued`
- `JobFailed`
- `IncidentOpened`
- `IncidentResolved`
- `SupportSessionStarted`
- `SupportSessionEnded`

---

## 12. MAPA DE RUTAS DEL BACKEN

```text
/admin
/admin/platform/config
/admin/platform/modules
/admin/platform/feature-flags
/admin/platform/environments
/admin/platform/releases

/admin/tenants
/admin/tenants/[tenantId]/overview
/admin/tenants/[tenantId]/modules
/admin/tenants/[tenantId]/settings
/admin/tenants/[tenantId]/users
/admin/tenants/[tenantId]/audit

/admin/security/users
/admin/security/users/[userId]
/admin/security/memberships
/admin/security/roles
/admin/security/roles/[roleId]
/admin/security/policies
/admin/security/sessions

/admin/ui/navigation
/admin/ui/menus
/admin/ui/overrides

/admin/master-data/catalogs
/admin/master-data/catalogs/[catalogId]

/admin/data/entities
/admin/data/relationships
/admin/data/validation
/admin/data/reference-models

/admin/audit/log
/admin/audit/events

/admin/operations/jobs
/admin/operations/errors
/admin/operations/incidents
/admin/operations/support

/admin/automation/rules

/admin/analytics/platform
/admin/analytics/usage
```

---

## 13. MAPA DE PANTALLAS Y COMPONENTES

## 13.1 `/admin/platform/modules`
Debe incluir:
- tabla de módulos
- filtros por status/category
- alta/edición de módulo
- dependencias por módulo
- activación/desactivación
- vista detalle con `firebaseAppId`, `remoteUrl`, versión y estado

## 13.2 `/admin/tenants/[tenantId]/modules`
Debe incluir:
- módulos habilitados del tenant
- estado
- límites
- configuración específica
- historial de cambios

## 13.3 `/admin/security/roles`
Debe incluir:
- listado de roles
- clonación
- builder de permisos
- selector de scope
- herencia entre roles
- vista diff entre roles

## 13.4 `/admin/ui/menus`
Debe incluir:
- árbol jerárquico
- drag & drop de orden
- control de iconos
- asociación a módulo
- permisos requeridos
- preview por rol y tenant

## 13.5 `/admin/data/relationships`
Debe incluir:
- entidad origen
- entidad destino
- cardinalidad
- estrategia de integración
- política de borrado lógico
- advertencias si rompe independencia modular

## 13.6 `/admin/audit/log`
Debe incluir:
- filtros por tenant, módulo, actor, entidad, fecha, severidad
- diff before/after
- export

## 13.7 `/admin/operations/support`
Debe incluir:
- apertura de sesión de soporte auditada
- simulación de contexto controlada
- resumen de tenant
- errores recientes
- eventos críticos recientes

---

## 14. CONTRATOS TYPESCRIPT OBLIGATORIOS

## 14.1 Core
```ts
export interface TenantContext {
  userId: string
  tenantId?: string
  activeRoleIds: string[]
  permissions: string[]
  enabledModules: string[]
  isPlatformAdmin: boolean
}

export interface AuthenticatedUser {
  userId: string
  email: string
  displayName: string
  status: 'invited' | 'active' | 'blocked' | 'disabled'
  globalType: 'platform_admin' | 'standard'
}

export interface AuditEvent {
  eventType: string
  entityType: string
  entityId: string
  actorUserId: string
  action: string
  tenantId?: string
  moduleId?: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  createdAt: Date
}
```

## 14.2 Roles
```ts
export interface RoleDefinition {
  id: string
  key: string
  name: string
  permissions: string[]
  scopes: Record<string, PermissionScope>
  inherits?: string[]
  active: boolean
}

export type PermissionScope = 'own' | 'team' | 'department' | 'tenant' | 'platform'
```

## 14.3 Navigation
```ts
export interface NavigationSchema {
  id: string
  key: string
  type: 'sidebar' | 'topbar' | 'hub-launcher' | 'admin'
  active: boolean
}

export interface NavigationItem {
  id: string
  navId: string
  parentId?: string
  label: string
  route: string
  moduleId?: string
  requiredPermissions: string[]
  requiredModules?: string[]
  sortOrder: number
  active: boolean
}
```

## 14.4 Governance
```ts
export interface EntityDefinition {
  key: string
  name: string
  storagePath: string
  scope: 'global' | 'tenant'
  auditable: boolean
  softDelete: boolean
}

export interface RelationshipDefinition {
  key: string
  sourceEntityKey: string
  targetEntityKey: string
  cardinality: '1:1' | '1:N' | 'N:N'
  strategy: 'reference' | 'projection' | 'event-driven'
  cascadePolicy: 'none' | 'restrict' | 'soft-delete'
}
```

---

## 15. REPOSITORY CONTRACTS OBLIGATORIOS

```ts
export interface UsersRepository {
  getById(userId: string): Promise<AuthenticatedUser | null>
  list(filters?: Record<string, unknown>): Promise<AuthenticatedUser[]>
  create(input: CreateUserInput): Promise<string>
  update(userId: string, input: UpdateUserInput): Promise<void>
  block(userId: string): Promise<void>
}

export interface TenantsRepository {
  getById(tenantId: string): Promise<Tenant | null>
  list(filters?: Record<string, unknown>): Promise<Tenant[]>
  create(input: CreateTenantInput): Promise<string>
  update(tenantId: string, input: UpdateTenantInput): Promise<void>
  suspend(tenantId: string): Promise<void>
}

export interface RolesRepository {
  listByTenant(tenantId: string): Promise<RoleDefinition[]>
  getById(tenantId: string, roleId: string): Promise<RoleDefinition | null>
  create(tenantId: string, input: CreateRoleInput): Promise<string>
  update(tenantId: string, roleId: string, input: UpdateRoleInput): Promise<void>
  remove(tenantId: string, roleId: string): Promise<void>
}

export interface NavigationRepository {
  listSchemas(): Promise<NavigationSchema[]>
  listItems(navId: string): Promise<NavigationItem[]>
  createItem(input: CreateNavigationItemInput): Promise<string>
  updateItem(itemId: string, input: UpdateNavigationItemInput): Promise<void>
}

export interface AuditRepository {
  append(event: AuditEvent): Promise<void>
  list(filters?: Record<string, unknown>): Promise<AuditEvent[]>
}
```

---

## 16. CASOS DE USO MÍNIMOS

### Platform
- registrar módulo
- cambiar estado de módulo
- actualizar configuración global
- publicar release
- gestionar feature flag

### Tenant
- crear tenant
- actualizar tenant
- suspender tenant
- habilitar módulo para tenant
- deshabilitar módulo para tenant

### Security
- invitar usuario
- activar membership
- bloquear usuario
- crear rol
- clonar rol
- asignar rol
- recalcular permisos efectivos

### Navigation
- crear esquema de navegación
- crear item de menú
- reordenar menú
- aplicar override tenant

### Governance
- registrar entidad
- registrar relación
- crear regla de validación
- crear catálogo
- crear item de catálogo

### Audit/Ops
- registrar evento de auditoría
- abrir incidente
- resolver incidente
- iniciar sesión de soporte
- cerrar sesión de soporte

---

## 17. VALIDACIONES FUNCIONALES OBLIGATORIAS

- no se puede habilitar un módulo tenant si el módulo global está `deprecated`
- no se puede eliminar un rol si está asignado a memberships activas
- no se puede desactivar el último `PlatformAdmin`
- no se puede suspender un tenant con jobs críticos en ejecución sin confirmación fuerte
- no se puede crear relación cross-module sin estrategia definida
- no se puede crear menú con ruta de módulo inexistente
- no se puede asignar permisos no reconocidos por catálogo de permisos

---

## 18. SEEDS INICIALES OBLIGATORIOS

### Módulos
- backend
- hub
- crm
- finanzas
- work-orders
- logistica-inventarios
- rrhh

### Roles base
- PlatformAdmin
- TenantAdmin
- SecurityAdmin
- SupportOperator
- ReadOnlyAuditor

### Catálogos base
- countries
- currencies
- locales
- module-categories
- tenant-status
- user-status
- severity-levels

### Navegación base
- admin-main
- hub-launcher

---

## 19. TESTING MÍNIMO REQUERIDO

### Unit
- resolución de permisos
- herencia de roles
- validación de feature flags
- creación de navegación jerárquica

### Integration
- create tenant + enable modules
- invite user + assign membership + assign role
- create role + apply permissions + authorize screen
- write audit event on critical action

### Security
- acceso cross-tenant denegado
- escritura directa de elevación de privilegios denegada
- lectura de global config solo para PlatformAdmin

### E2E
- alta tenant completa
- alta usuario y asignación de rol
- activación de módulo tenant
- edición de menú y visualización por rol
- consulta audit log

---

## 20. ORDEN DE IMPLEMENTACIÓN EJECUTABLE

### Fase B1
- contratos core
- modelo de datos global
- `_gl_platform_config`
- `_gl_modules`
- layout y shell admin

### Fase B2
- tenants
- users
- memberships
- resolución de contexto

### Fase B3
- roles
- permission engine
- guards por pantalla y acción

### Fase B4
- navigation schemas
- menu builder
- overrides por tenant

### Fase B5
- catalogs
- entities
- relationships
- validation rules

### Fase B6
- audit log
- event catalog
- jobs/errors/incidents

### Fase B7
- automation rules
- analytics
- hardening
- tests

---

## 21. DEFINITION OF DONE DEL BACKEN

El Backen se considera listo solo si:
- resuelve identidad y permisos correctamente
- gobierna módulos y tenants sin hardcodeo externo
- la navegación es declarativa
- los roles son configurables sin tocar código
- existe trazabilidad total
- hay reglas de seguridad activas
- hay seeds base y tests mínimos aprobados
- el Hub puede depender de Backen sin redefinir gobierno
- una micro app nueva puede integrarse sin rehacer arquitectura

---

## 22. REGLA FINAL

Nada del ecosistema puede nacer fuera del Backen en estos aspectos:
- módulos
- habilitaciones
- roles
- permisos
- menús
- catálogos globales
- entidades maestras
- relaciones maestras
- políticas de seguridad
- auditoría de plataforma

Si algo de esto se define fuera del Backen, se rompe la coherencia del sistema.

