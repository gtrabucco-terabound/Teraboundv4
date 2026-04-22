# Master Plan de Implementación — Terabound ERP Modular Multi-tenant

## Objetivo
Definir el plan maestro de implementación para Google AI Studio del ecosistema Terabound sobre Firebase, con módulos totalmente independientes, un Hub central de autenticación, un Backen Admin como plano de control y micro-sistemas separados por dominio.

## Principios rectores
- Monorepo oficial con `apps/`, `packages/` y `functions/`.
- Arquitectura multi-tenant estricta con aislamiento por `tenantId`.
- Repository Pattern para mantener agnosticismo de base de datos.
- SSO obligatorio en HUB mediante Firebase Auth.
- Cada módulo como app independiente dentro del mismo proyecto Firebase.
- Un único `projectId` compartido por todo el ecosistema y `appId` distinto por app.
- Sin lecturas cross-tenant.
- Todo cambio relevante genera eventos de auditoría.

## Módulos objetivo
- APP Backend Admin
- APP Hub
- APP CRM
- APP Finanzas
- APP Órdenes de Trabajo
- APP Logística & Inventarios
- APP RRHH

## Estructura objetivo del monorepo
```text
terabound-erp/
├── apps/
│   ├── backend/
│   ├── hub/
│   ├── mod-crm/
│   ├── mod-finanzas/
│   ├── mod-work-orders/
│   ├── mod-logistica-inventarios/
│   └── mod-rrhh/
├── packages/
│   ├── ui/
│   ├── domain/
│   ├── firebase-client/
│   ├── repositories/
│   ├── config/
│   └── auth/
├── functions/
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
└── turbo.json
```

## Capas del sistema
1. **Hub**: autenticación, resolución de tenant, bootstrap de contexto y enrutamiento hacia módulos.
2. **Backend Admin**: control plane, configuración global, registro de módulos, auditoría, gobierno de plataforma.
3. **Micro-sistemas**: apps independientes por dominio funcional.
4. **Functions**: lógica transversal, automatizaciones, eventos, proyecciones y seguridad.
5. **Packages compartidos**: contratos, UI, SDK Firebase, repositorios y configuración.

## Modelo de datos maestro

### Colecciones globales
#### `users/{userId}`
- email
- displayName
- photoURL
- status
- lastLoginAt
- createdAt
- updatedAt

#### `_gl_platform_config/{configId}`
Documento clave: `firebase_shared`
- apiKey
- authDomain
- projectId
- storageBucket
- messagingSenderId
- updatedAt
- updatedBy

#### `_gl_modules/{moduleId}`
- name
- slug
- remoteUrl
- firebaseAppId
- status
- icon
- category
- version
- createdAt
- updatedAt

#### `_gl_event_catalog/{eventType}`
- domain
- version
- retentionDays
- active

#### `_gl_audit_log/{eventId}`
- eventType
- actorUserId
- tenantId
- moduleId
- entityType
- entityId
- payload
- severity
- createdAt

### Colecciones multi-tenant
#### `tenants/{tenantId}`
- legalName
- tradeName
- taxId
- status
- timezone
- locale
- ownerUserId
- planId
- createdAt
- updatedAt

#### `tenants/{tenantId}/members/{membershipId}`
- userId
- roleId
- status
- moduleAccess
- invitedBy
- invitedAt
- activatedAt
- createdAt
- updatedAt

#### `tenants/{tenantId}/_tn_roles/{roleId}`
- name
- description
- permissions
- scope
- isSystem
- createdAt
- updatedAt

#### `tenants/{tenantId}/_tn_modules/{moduleId}`
- moduleId
- status
- enabledAt
- config
- limits
- updatedAt

#### `tenants/{tenantId}/_tn_settings/{settingId}`
- value
- type
- updatedAt
- updatedBy

#### `tenants/{tenantId}/_tn_event_log/{eventId}`
- eventType
- actorUserId
- moduleId
- entityType
- entityId
- payload
- createdAt

## Colecciones por módulo
Cada módulo debe vivir dentro del tenant y de forma aislada.

### CRM
- `tenants/{tenantId}/crm_leads/{leadId}`
- `tenants/{tenantId}/crm_accounts/{accountId}`
- `tenants/{tenantId}/crm_contacts/{contactId}`
- `tenants/{tenantId}/crm_opportunities/{opportunityId}`
- `tenants/{tenantId}/crm_activities/{activityId}`
- `tenants/{tenantId}/crm_pipelines/{pipelineId}`

### Finanzas
- `tenants/{tenantId}/fin_chart_of_accounts/{accountId}`
- `tenants/{tenantId}/fin_cost_centers/{costCenterId}`
- `tenants/{tenantId}/fin_journals/{journalId}`
- `tenants/{tenantId}/fin_journal_entries/{entryId}`
- `tenants/{tenantId}/fin_ap_invoices/{invoiceId}`
- `tenants/{tenantId}/fin_ar_invoices/{invoiceId}`
- `tenants/{tenantId}/fin_payments/{paymentId}`
- `tenants/{tenantId}/fin_periods/{periodId}`

### Órdenes de Trabajo
- `tenants/{tenantId}/wo_orders/{workOrderId}`
- `tenants/{tenantId}/wo_tasks/{taskId}`
- `tenants/{tenantId}/wo_assets/{assetId}`
- `tenants/{tenantId}/wo_templates/{templateId}`
- `tenants/{tenantId}/wo_checklists/{checklistId}`
- `tenants/{tenantId}/wo_reports/{reportId}`

### Logística & Inventarios
- `tenants/{tenantId}/lg_warehouses/{warehouseId}`
- `tenants/{tenantId}/lg_locations/{locationId}`
- `tenants/{tenantId}/lg_items/{itemId}`
- `tenants/{tenantId}/lg_stock_batches/{batchId}`
- `tenants/{tenantId}/lg_stock_movements/{movementId}`
- `tenants/{tenantId}/lg_purchase_orders/{poId}`
- `tenants/{tenantId}/lg_shipments/{shipmentId}`
- `tenants/{tenantId}/lg_suppliers/{supplierId}`

### RRHH
- `tenants/{tenantId}/hr_employees/{employeeId}`
- `tenants/{tenantId}/hr_positions/{positionId}`
- `tenants/{tenantId}/hr_departments/{departmentId}`
- `tenants/{tenantId}/hr_contracts/{contractId}`
- `tenants/{tenantId}/hr_attendance/{attendanceId}`
- `tenants/{tenantId}/hr_leave_requests/{leaveId}`
- `tenants/{tenantId}/hr_payroll_runs/{payrollRunId}`

## Relaciones maestras
- `users.userId` ↔ `tenants/{tenantId}/members.userId`
- `members.roleId` ↔ `tenants/{tenantId}/_tn_roles.roleId`
- `tenants/{tenantId}/_tn_modules.moduleId` ↔ `_gl_modules/{moduleId}`
- Todos los registros transaccionales de módulos deben incluir `tenantId`
- Todos los registros auditables deben enlazar con `_tn_event_log` o `_gl_audit_log`
- Entidades maestras compartidas entre módulos deben resolverse por referencias estables, no por acoplamiento directo

## Reglas de independencia modular
- Cada módulo tiene rutas, layouts, estados, repositorios y casos de uso propios.
- Solo comparten contratos en `packages/domain` y servicios transversales en `packages/*`.
- Ningún módulo consulta colecciones de otro módulo de forma directa.
- La interoperabilidad ocurre por eventos, proyecciones o referencias controladas.
- Cada módulo puede desplegarse de forma independiente.

## Contratos compartidos obligatorios
- `TenantContext`
- `AuthenticatedUser`
- `PermissionMatrix`
- `ModuleManifest`
- `AuditEvent`
- `PaginatedQuery`
- Interfaces Repository por agregado

## Fases de implementación en IA Studio
### Fase 0 — Gobierno técnico
- Consolidar documentos fuente.
- Definir fuente de verdad de variables y módulos.
- Marcar configuración obsoleta y conflictos.

### Fase 1 — Backbone del monorepo
- Crear monorepo.
- Inicializar apps y packages.
- Configurar TypeScript estricto, lint, format, turbo.
- Crear `packages/firebase-client` con patrón Singleton.

### Fase 2 — IAM y Hub
- Login único en HUB.
- Selector de tenant.
- Resolución de contexto: `userId`, `tenantId`, `role`, `modules`.
- Middleware y guards por sesión y permisos.

### Fase 3 — RBAC multi-tenant
- Colecciones `members` y `_tn_roles`.
- Pantalla `/settings/roles`.
- Matriz CRUD+A por entidad.
- Reglas Firestore alineadas a permisos.

### Fase 4 — Backend Admin / Control Plane
- `/admin/developer/config`
- `/admin/developer/modules`
- Generador `.env.local`
- Gestión de `_gl_platform_config` y `_gl_modules`

### Fase 5 — Fundaciones transversales
- Auditoría.
- Event log.
- Catálogo de eventos.
- App Check.
- Observabilidad.

### Fase 6 — CRM
- Catálogo comercial, leads, cuentas, contactos, oportunidades y actividades.
- Dashboards básicos, pipeline y permisos.

### Fase 7 — Finanzas
- Plan de cuentas, asientos, AP/AR, pagos y cierres.
- Integración por eventos con ventas e inventarios.

### Fase 8 — Órdenes de Trabajo
- Órdenes, activos, tareas, checklists y reportes.
- Integración con RRHH y Logística.

### Fase 9 — Logística & Inventarios
- Artículos, almacenes, movimientos, compras y despachos.
- Integración con Work Orders y Finanzas.

### Fase 10 — RRHH
- Empleados, estructura organizativa, asistencia, ausencias y payroll base.
- Integración con Work Orders y Finanzas.

### Fase 11 — Hardening y salida a producción
- Reglas Firestore.
- Índices.
- Testing.
- CI/CD.
- Ambientes.
- Despliegue independiente por app.

## Prompt maestro para Google AI Studio
"""
Actúa como Ingeniero Principal de Terabound ERP. Debes implementar un ecosistema modular multi-tenant sobre Firebase y Next.js App Router en TypeScript estricto.

Condiciones obligatorias:
1. Usa monorepo con apps independientes: backend, hub, mod-crm, mod-finanzas, mod-work-orders, mod-logistica-inventarios, mod-rrhh.
2. Usa packages compartidos: ui, domain, firebase-client, repositories, auth, config.
3. Implementa Repository Pattern. Ninguna capa de dominio depende directamente de Firestore.
4. El login existe solo en HUB con Firebase Auth.
5. Cada request debe resolver userId, tenantId, role y modules habilitados.
6. Toda consulta incluye tenantId. Prohibido cross-tenant.
7. Los módulos son independientes y se comunican por eventos o contratos compartidos.
8. Backend Admin incluye control plane con _gl_platform_config y _gl_modules.
9. Todos los cambios auditables generan eventos.
10. Respeta UI base Industrial Dark.
11. No avances de fase hasta terminar completamente la anterior.

Implementa por fases:
- Fase 1: Backbone de monorepo.
- Fase 2: IAM y HUB.
- Fase 3: RBAC multi-tenant.
- Fase 4: Backend Admin / Control Plane.
- Fase 5: Auditoría y eventos.
- Fase 6: CRM.
- Fase 7: Finanzas.
- Fase 8: Work Orders.
- Fase 9: Logística & Inventarios.
- Fase 10: RRHH.
- Fase 11: Hardening y producción.

Antes de generar código, crea los contratos, entidades, repositorios, rutas, pantallas, colecciones Firestore, reglas e índices necesarios.
"""

## Riesgos detectados
- Existe conflicto entre la configuración Firebase oficial del plan y un archivo SDK alterno.
- Debe imponerse una sola fuente de verdad desde el Control Plane.
- No conviene mezclar datos de módulos en colecciones genéricas.

## Decisiones recomendadas
- Adoptar `studio-1405627774-cebad` como proyecto base hasta validación contraria.
- Tratar el archivo SDK alterno como legado o no validado.
- Mantener separación física por app y separación lógica por subdominio funcional.
- Aplicar nombres de colección con prefijos por módulo.

## Entregables esperados por fase
- Código
- esquema Firestore
- reglas
- índices
- contratos
- pantallas
- seeds mínimos
- tests
- checklist de QA

