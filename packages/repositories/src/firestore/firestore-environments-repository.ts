import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  orderBy,
  query,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@terabound/firebase-client';
import { Collections } from '@terabound/config';
import type { EnvironmentConfig } from '@terabound/domain';
import type { EnvironmentsRepository } from '../contracts/environments-repository';

export class FirestoreEnvironmentsRepository implements EnvironmentsRepository {
  private get col() {
    return collection(getFirebaseFirestore(), Collections.ENVIRONMENTS);
  }

  async getById(envId: string): Promise<EnvironmentConfig | null> {
    const snap = await getDoc(doc(this.col, envId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as EnvironmentConfig;
  }

  async list(): Promise<EnvironmentConfig[]> {
    const q = query(this.col, orderBy('name', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as EnvironmentConfig[];
  }

  async update(envId: string, input: Partial<EnvironmentConfig>): Promise<void> {
    const ref = doc(this.col, envId);
    await updateDoc(ref, {
      ...input,
      updatedAt: new Date(),
    });
  }
}
