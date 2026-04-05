import { getFirestoreAdmin } from '@terabound/firebase-admin';
import type { AuditRepository, AuditEvent, TenantEventLog, EventCatalogEntry } from '@terabound/domain';

export class FirestoreAdminAuditRepository implements AuditRepository {
  private globalCollection = '_gl_audit_log';
  private catalogCollection = '_gl_event_catalog';

  async logGlobal(event: Omit<AuditEvent, 'createdAt'>): Promise<void> {
    try {
      const db = getFirestoreAdmin();
      await db.collection(this.globalCollection).add({
        ...event,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('[AdminAuditRepository] Error logging global event:', error);
    }
  }

  async logTenant(tenantId: string, event: Omit<TenantEventLog, 'id' | 'createdAt'>): Promise<void> {
    try {
      const db = getFirestoreAdmin();
      const tenantLogRef = db.collection(`tenants/${tenantId}/_tn_event_log`);
      await tenantLogRef.add({
        ...event,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error(`[AdminAuditRepository] Error logging tenant event (${tenantId}):`, error);
    }
  }

  async listGlobalLogs(filters?: any): Promise<AuditEvent[]> {
    const db = getFirestoreAdmin();
    let query = db.collection(this.globalCollection).orderBy('createdAt', 'desc');

    if (filters?.eventType) query = query.where('eventType', '==', filters.eventType);
    if (filters?.entityType) query = query.where('entityType', '==', filters.entityType);
    if (filters?.actorUserId) query = query.where('actorUserId', '==', filters.actorUserId);
    
    if (filters?.limit) query = query.limit(filters.limit);

    const snapshot = await query.get();
    return snapshot.docs.map((d: any) => ({
      ...d.data(),
      createdAt: d.data().createdAt?.toDate()
    } as AuditEvent));
  }

  // Métodos del catálogo
  async getEventCatalog(): Promise<EventCatalogEntry[]> {
    const db = getFirestoreAdmin();
    const snapshot = await db.collection(this.catalogCollection).orderBy('domain').orderBy('eventType').get();
    return snapshot.docs.map((d: any) => ({
      ...d.data(),
      createdAt: d.data().createdAt?.toDate(),
      updatedAt: d.data().updatedAt?.toDate()
    } as EventCatalogEntry));
  }

  async getEventDefinition(eventType: string): Promise<EventCatalogEntry | null> {
    const db = getFirestoreAdmin();
    const docRef = db.collection(this.catalogCollection).doc(eventType);
    const snap = await docRef.get();
    if (!snap.exists) return null;
    return {
      ...snap.data(),
      createdAt: snap.data()?.createdAt?.toDate(),
      updatedAt: snap.data()?.updatedAt?.toDate()
    } as EventCatalogEntry;
  }

  async updateEventDefinition(eventType: string, data: Partial<EventCatalogEntry>): Promise<void> {
    const db = getFirestoreAdmin();
    const docRef = db.collection(this.catalogCollection).doc(eventType);
    await docRef.update({
      ...data,
      updatedAt: new Date()
    });
  }

  // Dummy implementation for missing methods in interface if any
  async listTenantLogs(tenantId: string, filters?: any): Promise<TenantEventLog[]> {
    const db = getFirestoreAdmin();
    const path = `tenants/${tenantId}/_tn_event_log`;
    let query = db.collection(path).orderBy('createdAt', 'desc');
    if (filters?.limit) query = query.limit(filters.limit);
    const snapshot = await query.get();
    return snapshot.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate()
    } as TenantEventLog));
  }
}
