import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import type { Tenant } from '@terabound/domain';
import type { TenantsRepository } from '../contracts/tenants-repository';

export class FirestoreTenantsRepository implements TenantsRepository {
  private readonly collectionName = 'tenants';

  async list(): Promise<Tenant[]> {
    const db = getFirestore();
    const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Tenant));
  }

  async getById(id: string): Promise<Tenant | null> {
    const db = getFirestore();
    const docRef = doc(db, this.collectionName, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Tenant;
  }

  async create(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string> {
    const db = getFirestore();
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...tenant,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // En un entorno real, estos vendrían del contexto de auth
      createdBy: 'system_admin',
      updatedBy: 'system_admin'
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<Tenant>): Promise<void> {
    const db = getFirestore();
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }

  async delete(id: string): Promise<void> {
    const db = getFirestore();
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}
