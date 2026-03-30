import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
} from 'firebase/firestore';
import type { TenantModule } from '@terabound/domain';
import type { TenantsModulesRepository } from '../contracts/tenants-modules-repository';

export class FirestoreTenantsModulesRepository implements TenantsModulesRepository {
  private getCollectionPath(tenantId: string) {
    return `tenants/${tenantId}/_tn_modules`;
  }

  async list(tenantId: string): Promise<TenantModule[]> {
    const db = getFirestore();
    const q = query(collection(db, this.getCollectionPath(tenantId)));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TenantModule));
  }

  async getByModuleId(tenantId: string, moduleId: string): Promise<TenantModule | null> {
    const db = getFirestore();
    const docRef = doc(db, this.getCollectionPath(tenantId), moduleId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as TenantModule;
  }

  async upsert(tenantId: string, data: Omit<TenantModule, 'updatedAt' | 'updatedBy'>): Promise<void> {
    const db = getFirestore();
    const docRef = doc(db, this.getCollectionPath(tenantId), data.moduleId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: 'system_admin' // Mocked user
    });
  }

  async delete(tenantId: string, moduleId: string): Promise<void> {
    const db = getFirestore();
    const docRef = doc(db, this.getCollectionPath(tenantId), moduleId);
    await deleteDoc(docRef);
  }
}
