import { 
  getFirebaseFirestore, 
} from '@terabound/firebase-client';
import { 
  collection, 
  addDoc, 
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import type { AuditRepository, AuditEvent, TenantEventLog, EventCatalogEntry } from '@terabound/domain';


export class FirestoreAuditRepository implements AuditRepository {
  private globalCollection = '_gl_audit_log';
  private catalogCollection = '_gl_event_catalog';

  /**
   * Registro de Auditoría Global
   */
  async logGlobal(event: Omit<AuditEvent, 'createdAt'>): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      await addDoc(collection(db, this.globalCollection), {
        ...event,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('[AuditRepository] Error logging global event:', error);
    }
  }

  /**
   * Registro de Eventos de Tenant
   */
  async logTenant(tenantId: string, event: Omit<TenantEventLog, 'id' | 'createdAt'>): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const tenantLogRef = collection(db, `tenants/${tenantId}/_tn_event_log`);
      await addDoc(tenantLogRef, {
        ...event,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`[AuditRepository] Error logging tenant event (${tenantId}):`, error);
    }
  }

  /**
   * Listado Global de Auditoría
   */
  async listGlobalLogs(filters?: {
    eventType?: string;
    entityType?: string;
    actorUserId?: string;
    severity?: 'info' | 'warning' | 'critical';
    status?: 'success' | 'failure';
    limit?: number;
  }): Promise<AuditEvent[]> {
    const db = getFirebaseFirestore();
    let q = query(collection(db, this.globalCollection), orderBy('createdAt', 'desc'));

    if (filters?.eventType) q = query(q, where('eventType', '==', filters.eventType));
    if (filters?.entityType) q = query(q, where('entityType', '==', filters.entityType));
    if (filters?.actorUserId) q = query(q, where('actorUserId', '==', filters.actorUserId));
    if (filters?.severity) q = query(q, where('severity', '==', filters.severity));
    if (filters?.status) q = query(q, where('status', '==', filters.status));
    if (filters?.limit) q = query(q, limit(filters.limit));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      ...d.data(),
      createdAt: (d.data().createdAt as Timestamp)?.toDate()
    } as AuditEvent));
  }

  /**
   * Listado de Eventos por Tenant
   */
  async listTenantLogs(tenantId: string, filters?: {
    moduleId?: string;
    entityType?: string;
    limit?: number;
  }): Promise<TenantEventLog[]> {
    const db = getFirebaseFirestore();
    const path = `tenants/${tenantId}/_tn_event_log`;
    let q = query(collection(db, path), orderBy('createdAt', 'desc'));

    if (filters?.moduleId) q = query(q, where('moduleId', '==', filters.moduleId));
    if (filters?.entityType) q = query(q, where('entityType', '==', filters.entityType));
    if (filters?.limit) q = query(q, limit(filters.limit));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: (d.data().createdAt as Timestamp)?.toDate()
    } as TenantEventLog));
  }

  /**
   * Gestión del Catálogo de Eventos
   */
  async getEventCatalog(): Promise<EventCatalogEntry[]> {
    const db = getFirebaseFirestore();
    const q = query(collection(db, this.catalogCollection), orderBy('domain'), orderBy('eventType'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      ...d.data(),
      createdAt: (d.data().createdAt as Timestamp)?.toDate(),
      updatedAt: (d.data().updatedAt as Timestamp)?.toDate()
    } as EventCatalogEntry));
  }

  async getEventDefinition(eventType: string): Promise<EventCatalogEntry | null> {
    const db = getFirebaseFirestore();
    const docRef = doc(db, this.catalogCollection, eventType);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return {
      ...snap.data(),
      createdAt: (snap.data().createdAt as Timestamp)?.toDate(),
      updatedAt: (snap.data().updatedAt as Timestamp)?.toDate()
    } as EventCatalogEntry;
  }

  async updateEventDefinition(eventType: string, data: Partial<EventCatalogEntry>): Promise<void> {
    const db = getFirebaseFirestore();
    const docRef = doc(db, this.catalogCollection, eventType);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }
}
