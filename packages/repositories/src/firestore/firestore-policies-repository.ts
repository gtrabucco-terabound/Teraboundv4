import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  limit
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@terabound/firebase-client';
import type { SecurityPolicy } from '@terabound/domain';
import type { SecurityPoliciesRepository } from '../contracts/security-repositories';

export class FirestoreSecurityPoliciesRepository implements SecurityPoliciesRepository {
  private readonly collectionName = '_gl_security_policies';

  async list(): Promise<SecurityPolicy[]> {
    const db = getFirebaseFirestore();
    const colRef = collection(db, this.collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SecurityPolicy));
  }

  async getByKey(key: string): Promise<SecurityPolicy | null> {
    const db = getFirebaseFirestore();
    const q = query(
      collection(db, this.collectionName),
      where('key', '==', key),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    if (!docSnap) return null;
    return { id: docSnap.id, ...(docSnap.data() as any) } as unknown as SecurityPolicy;
  }


  async update(key: string, data: Partial<SecurityPolicy>): Promise<void> {
    const db = getFirebaseFirestore();
    const policy = await this.getByKey(key);
    if (!policy) throw new Error(`Security policy with key ${key} not found.`);
    
    const docRef = doc(db, this.collectionName, policy.id!);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }
}
