import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  where,
  collectionGroup,
  orderBy
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@terabound/firebase-client';
import { MembershipStatus } from '@terabound/domain';
import type { Membership } from '@terabound/domain';
import type { MembershipsRepository } from '../contracts/security-repositories';

export class FirestoreMembershipsRepository implements MembershipsRepository {
  private readonly collectionName = 'members';

  async listByTenant(tenantId: string): Promise<Membership[]> {
    const db = getFirebaseFirestore();
    const q = query(
      collection(db, 'tenants', tenantId, this.collectionName),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Membership));
  }

  async listByUser(userId: string): Promise<Membership[]> {
    const db = getFirebaseFirestore();
    const q = query(
      collectionGroup(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Membership));
  }

  async getById(tenantId: string, membershipId: string): Promise<Membership | null> {
    const db = getFirebaseFirestore();
    const docRef = doc(db, 'tenants', tenantId, this.collectionName, membershipId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Membership;
  }

  async create(tenantId: string, membership: Omit<Membership, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string> {
    try {
      const db = getFirebaseFirestore();
      const docRef = await addDoc(collection(db, 'tenants', tenantId, this.collectionName), {
        ...membership,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'system_admin',
        updatedBy: 'system_admin'
      });

      return docRef.id;
    } catch (error) {
      console.error('[FirestoreMembershipsRepository] Create error:', error);
      throw error;
    }
  }

  async update(tenantId: string, membershipId: string, data: Partial<Membership>): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const docRef = doc(db, 'tenants', tenantId, this.collectionName, membershipId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('[FirestoreMembershipsRepository] Update error:', error);
      throw error;
    }
  }

  async revoke(tenantId: string, membershipId: string): Promise<void> {
    await this.update(tenantId, membershipId, { status: MembershipStatus.REVOKED });
  }

  async changeRole(tenantId: string, membershipId: string, roleId: string): Promise<void> {
    await this.update(tenantId, membershipId, { roleId });
  }

  async delete(tenantId: string, membershipId: string): Promise<void> {
    const db = getFirebaseFirestore();
    const docRef = doc(db, 'tenants', tenantId, this.collectionName, membershipId);
    await deleteDoc(docRef);
  }
}
