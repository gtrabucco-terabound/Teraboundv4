import { 
  collection, 
  addDoc, 
  getDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@terabound/firebase-client';
import { Collections } from '@terabound/config';
import type { Incident, IncidentsRepository } from '../contracts/incidents-repository';

export class FirestoreIncidentsRepository implements IncidentsRepository {
  private collectionName = Collections.INCIDENTS;

  async create(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = getFirebaseFirestore();
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...incident,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async getById(id: string): Promise<Incident | null> {
    const db = getFirebaseFirestore();
    const docSnap = await getDoc(doc(db, this.collectionName, id));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Incident;
  }

  async list(filters?: any): Promise<Incident[]> {
    const db = getFirebaseFirestore();
    let q = query(collection(db, this.collectionName));
    
    if (filters?.type) {
      q = query(q, where('type', '==', filters.type));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Incident));
  }
}
