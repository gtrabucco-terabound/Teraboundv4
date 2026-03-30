import { 
  getFirebaseFirestore, 
} from '@terabound/firebase-client';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { FirestoreAuditRepository } from './firestore-audit-repository';

import type { RoleDefinition } from '@terabound/domain';
import type { RolesRepository } from '../contracts/security-repositories';

export class FirestoreRolesRepository implements RolesRepository {
  private globalCollection = '_gl_roles';
  private audit = new FirestoreAuditRepository();

  async listGlobal(): Promise<RoleDefinition[]> {
    const db = getFirebaseFirestore();
    const snapshot = await getDocs(collection(db, this.globalCollection));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  }

  async listByTenant(tenantId: string): Promise<RoleDefinition[]> {
    const db = getFirebaseFirestore();
    const snapshot = await getDocs(collection(db, `tenants/${tenantId}/_tn_roles`));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  }

  async getById(id: string, tenantId?: string): Promise<RoleDefinition | null> {
    const db = getFirebaseFirestore();
    const path = tenantId ? `tenants/${tenantId}/_tn_roles` : this.globalCollection;
    const docRef = doc(db, path, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as any;
  }

  async create(role: Omit<RoleDefinition, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>, tenantId?: string): Promise<string> {
    try {
      const db = getFirebaseFirestore();
      // GAP 3: Determinar scope y colección
      const scope = tenantId ? 'tenant' : 'platform';
      const path = tenantId ? `tenants/${tenantId}/_tn_roles` : this.globalCollection;
      
      const docRef = await addDoc(collection(db, path), {
        ...role,
        scope,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // GAP 5: Auditoría
      if (tenantId) {
        await this.audit.logTenant(tenantId, {
          eventType: 'RoleCreated',
          entityType: 'Role',
          entityId: docRef.id,
          actorUserId: 'system-admin',
          payload: { roleKey: role.key }
        });
      } else {
        await this.audit.logGlobal({
          eventType: 'RoleCreated',
          entityType: 'Role',
          entityId: docRef.id,
          actorUserId: 'system-admin',
          actorType: 'user',
          action: 'CREATE',
          severity: 'info'
        });
      }

      return docRef.id;
    } catch (error) {
       console.error('[FirestoreRolesRepository] Create error:', error);
       throw error;
    }
  }

  async update(id: string, data: Partial<RoleDefinition>, tenantId?: string): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const path = tenantId ? `tenants/${tenantId}/_tn_roles` : this.globalCollection;
      const docRef = doc(db, path, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      // GAP 5: Auditoría
      if (tenantId) {
        await this.audit.logTenant(tenantId, {
          eventType: 'RoleUpdated',
          entityType: 'Role',
          entityId: id,
          actorUserId: 'system-admin'
        });
      } else {
        await this.audit.logGlobal({
          eventType: 'RoleUpdated',
          entityType: 'Role',
          entityId: id,
          actorUserId: 'system-admin',
          actorType: 'user',
          action: 'UPDATE',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('[FirestoreRolesRepository] Update error:', error);
      throw error;
    }
  }

  async delete(id: string, tenantId?: string): Promise<void> {
    const db = getFirebaseFirestore();
    const path = tenantId ? `tenants/${tenantId}/_tn_roles` : this.globalCollection;
    const docRef = doc(db, path, id);
    await deleteDoc(docRef);
  }
}
