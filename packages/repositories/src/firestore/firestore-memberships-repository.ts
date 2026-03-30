import { 
  getFirebaseFirestore, 
} from '@terabound/firebase-client';
import { 
  collection, 
  collectionGroup, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { FirestoreAuditRepository } from './firestore-audit-repository';
import { MembershipStatus } from '@terabound/domain';
import type { Membership } from '@terabound/domain';
import type { MembershipsRepository } from '../contracts/security-repositories';

export class FirestoreMembershipsRepository implements MembershipsRepository {
  private audit = new FirestoreAuditRepository();
  
  async listByTenant(tenantId: string): Promise<Membership[]> {
    const db = getFirebaseFirestore();
    const colRef = collection(db, 'tenants', tenantId, 'members');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Membership));
  }

  async listByUser(userId: string): Promise<Membership[]> {
    const db = getFirebaseFirestore();
    // Uso de collectionGroup para auditoría transversal de membresías
    const q = query(collectionGroup(db, 'members'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Membership));
  }

  async getById(tenantId: string, membershipId: string): Promise<Membership | null> {
    const db = getFirebaseFirestore();
    const docRef = doc(db, 'tenants', tenantId, 'members', membershipId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Membership;
  }

  async create(tenantId: string, membership: Omit<Membership, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string> {
    const db = getFirebaseFirestore();
    const colRef = collection(db, 'tenants', tenantId, 'members');
    const docRef = await addDoc(colRef, {
      ...membership,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'system_admin',
      updatedBy: 'system_admin'
    });
    return docRef.id;
  }

  async update(tenantId: string, membershipId: string, data: Partial<Membership>): Promise<void> {
    const db = getFirebaseFirestore();
    const docRef = doc(db, 'tenants', tenantId, 'members', membershipId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }

  async delete(tenantId: string, membershipId: string): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const docRef = doc(db, `tenants/${tenantId}/members`, membershipId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('[FirestoreMembershipsRepository] Delete error:', error);
      throw error;
    }
  }

  async revoke(tenantId: string, membershipId: string): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const docRef = doc(db, `tenants/${tenantId}/members`, membershipId);
      await updateDoc(docRef, {
        status: MembershipStatus.REVOKED,
        updatedAt: serverTimestamp()
      });

      await this.audit.logTenant(tenantId, {
        eventType: 'MembershipRevoked',
        entityType: 'Membership',
        entityId: membershipId,
        actorUserId: 'system-admin',
        moduleId: 'security'
      });
    } catch (error) {
      console.error('[FirestoreMembershipsRepository] Revoke error:', error);
      throw error;
    }
  }

  async changeRole(tenantId: string, membershipId: string, roleId: string): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const docRef = doc(db, `tenants/${tenantId}/members`, membershipId);
      await updateDoc(docRef, {
        roleId,
        updatedAt: serverTimestamp()
      });

      await this.audit.logTenant(tenantId, {
        eventType: 'MembershipUpdated',
        entityType: 'Membership',
        entityId: membershipId,
        actorUserId: 'system-admin',
        payload: { newRole: roleId }
      });
    } catch (error) {
      console.error('[FirestoreMembershipsRepository] ChangeRole error:', error);
      throw error;
    }
  }
}
