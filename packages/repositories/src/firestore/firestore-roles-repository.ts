import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@terabound/firebase-client';
import type { RoleDefinition } from '@terabound/domain';
import type { RolesRepository } from '../contracts/security-repositories';

export class FirestoreRolesRepository implements RolesRepository {
  private readonly globalCollection = '_gl_roles';
  private readonly tenantRolesSubcollection = '_tn_roles';

  async listGlobal(): Promise<RoleDefinition[]> {
    const db = getFirebaseFirestore();
    const q = query(collection(db, this.globalCollection), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RoleDefinition));
  }

  async listByTenant(tenantId: string): Promise<RoleDefinition[]> {
    const db = getFirebaseFirestore();
    const q = query(collection(db, 'tenants', tenantId, this.tenantRolesSubcollection), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RoleDefinition));
  }

  async getById(id: string, tenantId?: string): Promise<RoleDefinition | null> {
    const db = getFirebaseFirestore();
    const docRef = tenantId 
      ? doc(db, 'tenants', tenantId, this.tenantRolesSubcollection, id)
      : doc(db, this.globalCollection, id);
    
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as RoleDefinition;
  }

  async create(role: Omit<RoleDefinition, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>, tenantId?: string): Promise<string> {
    const db = getFirebaseFirestore();
    const colRef = tenantId 
      ? collection(db, 'tenants', tenantId, this.tenantRolesSubcollection)
      : collection(db, this.globalCollection);
    
    const docRef = await addDoc(colRef, {
      ...role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'system_admin',
      updatedBy: 'system_admin'
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<RoleDefinition>, tenantId?: string): Promise<void> {
    const db = getFirebaseFirestore();
    const docRef = tenantId 
      ? doc(db, 'tenants', tenantId, this.tenantRolesSubcollection, id)
      : doc(db, this.globalCollection, id);

    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }
}
