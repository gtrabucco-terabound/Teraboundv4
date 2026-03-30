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
    const db = getFirebaseFirestore();
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'system_admin', // En prod vendría del Auth context
      updatedBy: 'system_admin'
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<UserRecord>): Promise<void> {
    const db = getFirebaseFirestore();
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }
}
