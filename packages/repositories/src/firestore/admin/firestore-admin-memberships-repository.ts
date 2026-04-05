import { getFirestoreAdmin } from '@terabound/firebase-admin';
import type { Membership } from '@terabound/domain';
import type { MembershipsRepository } from '../../contracts/security-repositories';

export class FirestoreAdminMembershipsRepository implements MembershipsRepository {
  
  async listByTenant(tenantId: string): Promise<Membership[]> {
    const db = getFirestoreAdmin();
    const snapshot = await db.collection(`tenants/${tenantId}/_tn_memberships`).get();
    return snapshot.docs.map(doc => this.sanitize({ id: doc.id, tenantId, ...doc.data() }));
  }

  async listByUser(userId: string): Promise<Membership[]> {
    const db = getFirestoreAdmin();
    // Uso de group collection para búsqueda transversal (requiere índice en remoto)
    // Para el admin, si no hay índices, podría fallar. Implementamos seguro.
    try {
      const snapshot = await db.collectionGroup('_tn_memberships')
        .where('userId', '==', userId)
        .get();
      return snapshot.docs.map(doc => this.sanitize({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn('[AdminMemberships] collectionGroup failed, verify indexes.', e);
      return [];
    }
  }

  async getById(tenantId: string, membershipId: string): Promise<Membership | null> {
    const db = getFirestoreAdmin();
    const snap = await db.collection(`tenants/${tenantId}/_tn_memberships`).doc(membershipId).get();
    if (!snap.exists) return null;
    return this.sanitize({ id: snap.id, tenantId, ...snap.data() });
  }

  async create(tenantId: string, membership: Omit<Membership, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string> {
    const db = getFirestoreAdmin();
    const docRef = await db.collection(`tenants/${tenantId}/_tn_memberships`).add({
      ...membership,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  async update(tenantId: string, membershipId: string, data: Partial<Membership>): Promise<void> {
    const db = getFirestoreAdmin();
    await db.collection(`tenants/${tenantId}/_tn_memberships`).doc(membershipId).update({
      ...data,
      updatedAt: new Date()
    });
  }

  async revoke(tenantId: string, membershipId: string): Promise<void> {
    await this.update(tenantId, membershipId, { status: 'revoked' as any });
  }

  async changeRole(tenantId: string, membershipId: string, roleId: string): Promise<void> {
    await this.update(tenantId, membershipId, { roleId });
  }

  async delete(tenantId: string, membershipId: string): Promise<void> {
    const db = getFirestoreAdmin();
    await db.collection(`tenants/${tenantId}/_tn_memberships`).doc(membershipId).delete();
  }

  private sanitize(data: any): Membership {
    if (!data) return data;
    const result = { ...data };
    if (result.createdAt?.toDate) result.createdAt = result.createdAt.toDate().toISOString();
    if (result.updatedAt?.toDate) result.updatedAt = result.updatedAt.toDate().toISOString();
    if (result.lastAccessAt?.toDate) result.lastAccessAt = result.lastAccessAt.toDate().toISOString();
    return result as Membership;
  }
}
