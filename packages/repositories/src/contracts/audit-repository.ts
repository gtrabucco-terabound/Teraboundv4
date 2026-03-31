import type { AuditEvent, TenantEventLog } from '@terabound/domain';
import type { EventCatalogEntry } from '@terabound/domain';

export interface AuditRepository {
  // Escritura (Server-side side only conceptually, but interface remains)
  logGlobal(event: Omit<AuditEvent, 'createdAt'>): Promise<void>;
  logTenant(tenantId: string, event: Omit<TenantEventLog, 'id' | 'createdAt'>): Promise<void>;

  // Lectura Global
  listGlobalLogs(filters?: {
    eventType?: string;
    entityType?: string;
    actorUserId?: string;
    severity?: 'info' | 'warning' | 'critical';
    status?: 'success' | 'failure';
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
