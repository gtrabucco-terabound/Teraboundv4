import { getFirestoreAdmin } from '@terabound/firebase-admin';
import type { RoleDefinition } from '@terabound/domain';
import type { RolesRepository } from '../../contracts/security-repositories';

export class FirestoreAdminRolesRepository implements RolesRepository {
  private globalCollection = '_gl_roles';

  async listGlobal(): Promise<RoleDefinition[]> {
    const db = getFirestoreAdmin();
    const snapshot = await db.collection(this.globalCollection).get();
    return snapshot.docs.map((doc: any) => this.sanitize({ id: doc.id, ...doc.data() }));
  }

  async listByTenant(tenantId: string): Promise<RoleDefinition[]> {
    const db = getFirestoreAdmin();
    const snapshot = await db.collection(`tenants/${tenantId}/_tn_roles`).get();
    return snapshot.docs.map((doc: any) => this.sanitize({ id: doc.id, ...doc.data() }));
  }

  async getById(id: string, tenantId?: string): Promise<RoleDefinition | null> {
    const db = getFirestoreAdmin();
    const path = tenantId ? `tenants/${tenantId}/_tn_roles` : this.globalCollection;
    const docRef = db.collection(path).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return null;
    return this.sanitize({ id: snapshot.id, ...snapshot.data() });
  }

  /**
   * Convierte Timestamps de Firebase a Strings ISO para serialización en Server Actions
   */
  private sanitize(data: any): RoleDefinition {
    if (!data) return data;
    const result = { ...data };
    if (result.createdAt && typeof result.createdAt.toDate === 'function') {
      result.createdAt = result.createdAt.toDate().toISOString();
    }
    if (result.updatedAt && typeof result.updatedAt.toDate === 'function') {
      result.updatedAt = result.updatedAt.toDate().toISOString();
    }
    return result as RoleDefinition;
  }

  async create(role: Omit<RoleDefinition, 'id' | 'createdAt' | 'updatedAt'>, tenantId?: string): Promise<string> {
    try {
      const db = getFirestoreAdmin();
      const scope = tenantId ? 'tenant' : 'platform';
      const path = tenantId ? `tenants/${tenantId}/_tn_roles` : this.globalCollection;
      
      const docRef = await db.collection(path).add({
        ...role,
        scope,
        createdAt: new Date(), // En Admin SDK, se usa Date() o FieldValue
        updatedAt: new Date(),
      });

      return docRef.id;
    } catch (error) {
       console.error('[FirestoreAdminRolesRepository] Create error:', error);
       throw error;
    }
  }

  async update(id: string, data: Partial<RoleDefinition>, tenantId?: string): Promise<void> {
    try {
      const db = getFirestoreAdmin();
      const path = tenantId ? `tenants/${tenantId}/_tn_roles` : this.globalCollection;
      const docRef = db.collection(path).doc(id);
      await docRef.update({
        ...data,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('[FirestoreAdminRolesRepository] Update error:', error);
      throw error;
    }
  }

  async delete(id: string, tenantId?: string): Promise<void> {
    const db = getFirestoreAdmin();
    const path = tenantId ? `tenants/${tenantId}/_tn_roles` : this.globalCollection;
    const docRef = db.collection(path).doc(id);
    await docRef.delete();
  }
}
