import { 
  getFirebaseFirestore, 
} from '@terabound/firebase-client';
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import type { AuditEvent, TenantEventLog } from '@terabound/domain';


export class FirestoreAuditRepository {
  private globalCollection = '_gl_audit_log';

  /**
   * Registra un evento de auditoría global
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
      // No lanzamos error para no bloquear la operación principal
    }
  }

  /**
   * Registra un evento en el log de un tenant
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
}
