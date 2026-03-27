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
import type { FeatureFlag } from '@terabound/domain';
import type { FeatureFlagsRepository } from '../contracts/feature-flags-repository';

export class FirestoreFeatureFlagsRepository implements FeatureFlagsRepository {
  private get col() {
    return collection(getFirebaseFirestore(), Collections.FEATURE_FLAGS);
  }

  async getById(flagId: string): Promise<FeatureFlag | null> {
    const snap = await getDoc(doc(this.col, flagId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...this.mapFromFirestore(snap.data()) } as FeatureFlag;
  }

  async getByKey(key: string): Promise<FeatureFlag | null> {
    const q = query(this.col, where('key', '==', key));
    const snap = await getDocs(q);

    // 1. Verificamos si la consulta devolvió documentos
    if (snap.empty) return null;

    // 2. Obtenemos el primer documento
    const d = snap.docs[0];

    // 3. Verificación de seguridad para TypeScript (Soluciona el error de Vercel)
    if (!d || !d.exists()) return null;

    // 4. Retornamos el objeto mapeado con el ID
    return {
      id: d.id,
      ...this.mapFromFirestore(d.data() as Record<string, unknown>)
    } as FeatureFlag;
  }

  async list(filters?: { enabled?: boolean; scope?: string }): Promise<FeatureFlag[]> {
    const constraints = [];
    if (filters?.enabled !== undefined) constraints.push(where('enabled', '==', filters.enabled));
    if (filters?.scope) constraints.push(where('scope', '==', filters.scope));
    constraints.push(orderBy('key', 'asc'));

    const q = query(this.col, ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...this.mapFromFirestore(d.data() || {}),
    })) as FeatureFlag[];
  }

  async create(input: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(this.col, {
      ...input,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async update(flagId: string, input: Partial<FeatureFlag>): Promise<void> {
    const ref = doc(this.col, flagId);
    await updateDoc(ref, {
      ...input,
      updatedAt: Timestamp.now(),
    });
  }

  async toggle(flagId: string, enabled: boolean): Promise<void> {
    return this.update(flagId, { enabled });
  }

  private mapFromFirestore(data: Record<string, unknown>): Omit<FeatureFlag, 'id'> {
    return {
      ...data,
      createdAt: (data['createdAt'] as Timestamp)?.toDate() ?? new Date(),
      updatedAt: (data['updatedAt'] as Timestamp)?.toDate() ?? new Date(),
    } as Omit<FeatureFlag, 'id'>;
  }
}
