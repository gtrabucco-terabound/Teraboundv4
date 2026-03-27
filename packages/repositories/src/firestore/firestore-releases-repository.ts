import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@terabound/firebase-client';
import { Collections } from '@terabound/config';
import type { ReleaseDefinition } from '@terabound/domain';
import type { ReleasesRepository } from '../contracts/releases-repository';

export class FirestoreReleasesRepository implements ReleasesRepository {
  private get col() {
    return collection(getFirebaseFirestore(), Collections.RELEASES);
  }

  async getById(releaseId: string): Promise<ReleaseDefinition | null> {
    const snap = await getDoc(doc(this.col, releaseId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...this.mapFromFirestore(snap.data()) } as ReleaseDefinition;
  }

  async list(filters?: { status?: string }): Promise<ReleaseDefinition[]> {
    const constraints = [];
    if (filters?.status) constraints.push(where('status', '==', filters.status));
    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(this.col, ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...this.mapFromFirestore(d.data()) })) as ReleaseDefinition[];
  }

  async create(input: Omit<ReleaseDefinition, 'id' | 'createdAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(this.col, {
      ...input,
      createdAt: now,
    });
    return docRef.id;
  }

  async updateStatus(releaseId: string, status: string): Promise<void> {
    const ref = doc(this.col, releaseId);
    await updateDoc(ref, {
      status,
    });
  }

  private mapFromFirestore(data: Record<string, unknown>): Omit<ReleaseDefinition, 'id'> {
    return {
      ...data,
      createdAt: (data['createdAt'] as Timestamp)?.toDate() ?? new Date(),
      releasedAt: (data['releasedAt'] as Timestamp)?.toDate() ?? undefined,
    } as Omit<ReleaseDefinition, 'id'>;
  }
}
