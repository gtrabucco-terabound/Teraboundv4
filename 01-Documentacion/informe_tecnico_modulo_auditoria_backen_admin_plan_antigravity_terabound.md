# Plan de Implementación: Auditoría & Event System (Actualizado)

Este plan incorpora los requerimientos normativos del `informe_tecnico_modulo_auditoria_backen_admin_terabound.md` para garantizar trazabilidad completa y gobernanza en Terabound ERP.

## Revisión del Usuario Requerida

> [!IMPORTANT]
> Se implementará la restricción de **escritura solo server-side** para auditoría. Cualquier intento de escritura directa desde el cliente será bloqueado por las reglas de Firestore (Gap 5).

## Cambios Propuestos

### 1. Contratos y Dominio (packages/domain)

#### [MODIFY] [tenant-context.ts](file:///c:/Users/gtrabucco/Desktop/Terabound/6-Terabound_new/02-M_Backend/packages/domain/src/contracts/tenant-context.ts)
- Actualizar `AuditEvent` para incluir: `status`, `errorCode`, `correlationId`, `source`.
- Definir `TenantEventLog` para las entradas en `tenants/{id}/_tn_event_log`.

#### [MODIFY] [events.ts](file:///c:/Users/gtrabucco/Desktop/Terabound/6-Terabound_new/02-M_Backend/packages/domain/src/contracts/events.ts)
- Sincronizar `EventCatalogEntry` con la especificación (domain, version, retentionDays).

---

### 2. Infraestructura de Datos (packages/repositories)

#### [NEW] [audit-repository.ts](file:///c:/Users/gtrabucco/Desktop/Terabound/6-Terabound_new/02-M_Backend/packages/repositories/src/contracts/audit-repository.ts)
- Interfaz estricta: `listGlobalLogs`, `listTenantLogs`, `getEventCatalog`, `logGlobal`, `logTenant`.

#### [MODIFY] [firestore-audit-repository.ts](file:///c:/Users/gtrabucco/Desktop/Terabound/6-Terabound_new/02-M_Backend/packages/repositories/src/firestore/firestore-audit-repository.ts)
- Implementar métodos de búsqueda con ordenamiento por `createdAt desc`.
- Soporte para filtros por dominio, severidad y actor.

#### [MODIFY] [index.ts](file:///c:/Users/gtrabucco/Desktop/Terabound/6-Terabound_new/02-M_Backend/packages/repositories/src/index.ts)
- Exportar `FirestoreAuditRepository` y `AuditRepository`.

#### [NEW] [audit-seed.ts](file:///c:/Users/gtrabucco/Desktop/Terabound/6-Terabound_new/02-M_Backend/packages/repositories/src/seed/audit-seed.ts)
- Semilla para el catálogo inicial de eventos (IAM, Platform, Tenant, etc.).

---

### 3. Backend Admin UI (apps/backend)

#### [NEW] [admin/audit/log/page.tsx](file:///c:/Users/gtrabucco/Desktop/Terabound/6-Terabound_new/02-M_Backend/apps/backend/src/app/admin/audit/log/page.tsx)
- Tabla de auditoría con estados visuales (succeess/failure).
- Panel de detalles con visor de Diff (Before/After).
- Filtros por `severity` y `actorType`.

#### [NEW] [admin/audit/events/page.tsx](file:///c:/Users/gtrabucco/Desktop/Terabound/6-Terabound_new/02-M_Backend/apps/backend/src/app/admin/audit/events/page.tsx)
- Gestión/Visualización del catálogo de eventos.
- Indicadores de retención y severidad por defecto.

---

### 4. Seguridad y Gobernanza

#### [MODIFY] [firestore.rules](file:///c:/Users/gtrabucco/Desktop/Terabound/6-Terabound_new/02-M_Backend/firestore.rules)
- Asegurar que `_gl_audit_log` sea `allow read: if isPlatformAdmin()` y `allow write: if false` (escritura solo via Admin SDK).

## Preguntas Abiertas

> [!NOTE]
> ¿Deseas que los seeds se ejecuten automáticamente al iniciar el entorno de desarrollo o prefieres un comando manual dedicado? La norma sugiere ejecución manual.

## Plan de Verificación

### Pruebas Automatizadas (Simuladas)
- Verificación de que el payload auditado no contenga campos sensibles (masking).

### Manual Verification
1. Generar actividades (ej: crear usuario) y verificar que aparezcan en el log global.
2. Validar que la UI de Eventos muestre correctamente los días de retención definidos en el seed.
