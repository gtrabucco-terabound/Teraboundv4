import type { AuditEvent, TenantEventLog, AuditSeverity, AuditStatus } from './tenant-context';
import type { EventCatalogEntry } from './events';

export interface AuditRepository {
  // Escritura
  logGlobal(event: Omit<AuditEvent, 'createdAt'>): Promise<void>;
  logTenant(tenantId: string, event: Omit<TenantEventLog, 'id' | 'createdAt'>): Promise<void>;

  // Lectura Global
  listGlobalLogs(filters?: {
    eventType?: string;
    entityType?: string;
    actorUserId?: string;
    severity?: AuditSeverity;
    status?: AuditStatus;
    limit?: number;
  }): Promise<AuditEvent[]>;

  // Lectura Tenant
  listTenantLogs(tenantId: string, filters?: {
    moduleId?: string;
    entityType?: string;
    limit?: number;
  }): Promise<TenantEventLog[]>;

  // Catálogo de Eventos
  getEventCatalog(): Promise<EventCatalogEntry[]>;
  getEventDefinition(eventType: string): Promise<EventCatalogEntry | null>;
  updateEventDefinition(eventType: string, data: Partial<EventCatalogEntry>): Promise<void>;
}
