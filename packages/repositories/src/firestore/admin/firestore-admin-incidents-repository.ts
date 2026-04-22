import { getFirestoreAdmin } from '@terabound/firebase-admin';
import { Collections } from '@terabound/config';
import type { Incident, IncidentsRepository } from '../../contracts/incidents-repository';

export class FirestoreAdminIncidentsRepository implements IncidentsRepository {
  private collectionName = Collections.INCIDENTS;

  async create(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = getFirestoreAdmin();
    const docRef = await db.collection(this.collectionName).add({
      ...incident,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  async getById(id: string): Promise<Incident | null> {
    const db = getFirestoreAdmin();
    const docSnap = await db.collection(this.collectionName).doc(id).get();
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() } as Incident;
  }

  async list(filters?: any): Promise<Incident[]> {
    const db = getFirestoreAdmin();
    let query = db.collection(this.collectionName) as any;
    
    if (filters?.type) {
      query = query.where('type', '==', filters.type);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Incident));
  }
}
