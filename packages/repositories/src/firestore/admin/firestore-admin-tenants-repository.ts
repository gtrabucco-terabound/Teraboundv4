import { getFirestoreAdmin } from '@terabound/firebase-admin';
import type { Tenant } from '@terabound/domain';
import type { TenantsRepository } from '../../contracts/tenants-repository';

export class FirestoreAdminTenantsRepository implements TenantsRepository {
  private readonly collectionName = 'tenants';

  async list(): Promise<Tenant[]> {
    const db = getFirestoreAdmin();
    const snapshot = await db.collection(this.collectionName).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => this.sanitize({ id: doc.id, ...doc.data() }));
  }

  async getById(id: string): Promise<Tenant | null> {
    const db = getFirestoreAdmin();
    const snapshot = await db.collection(this.collectionName).doc(id).get();
    if (!snapshot.exists) return null;
    return this.sanitize({ id: snapshot.id, ...snapshot.data() });
  }

  async create(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string> {
    const db = getFirestoreAdmin();
    const docRef = await db.collection(this.collectionName).add({
      ...tenant,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin-123',
      updatedBy: 'admin-123'
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<Tenant>): Promise<void> {
    const db = getFirestoreAdmin();
    await db.collection(this.collectionName).doc(id).update({
      ...data,
      updatedAt: new Date()
    });
  }

  async delete(id: string): Promise<void> {
    const db = getFirestoreAdmin();
    await db.collection(this.collectionName).doc(id).delete();
  }

  private sanitize(data: any): Tenant {
    if (!data) return data;
    const result = { ...data };
    if (result.createdAt?.toDate) result.createdAt = result.createdAt.toDate().toISOString();
    if (result.updatedAt?.toDate) result.updatedAt = result.updatedAt.toDate().toISOString();
    return result as Tenant;
  }
}
