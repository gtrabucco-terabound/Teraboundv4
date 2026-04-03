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
import type { UserRecord } from '@terabound/domain';
import type { UsersRepository } from '../contracts/security-repositories';

export class FirestoreUsersRepository implements UsersRepository {
  private readonly collectionName = 'users';

  async list(): Promise<UserRecord[]> {
    const db = getFirebaseFirestore();
    const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    } as unknown as UserRecord));
  }

  async getById(id: string): Promise<UserRecord | null> {
    const db = getFirebaseFirestore();
    const docRef = doc(db, this.collectionName, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...(snapshot.data() as any) } as unknown as UserRecord;
  }

  async create(user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string> {
    // GAP 1: Solo se permite crear usuarios de plataforma
    if ((user as any).globalType === 'tenant_user') {
      throw new Error('Creación de usuarios operativos (tenant_user) no permitida desde el Backend Admin.');
    }

    try {
      const db = getFirebaseFirestore();
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'system_admin',
        updatedBy: 'system_admin'
      });

      return docRef.id;
    } catch (error) {
      console.error('[FirestoreUsersRepository] Create error:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<UserRecord>): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('[FirestoreUsersRepository] Update error:', error);
      throw error;
    }
  }
}
