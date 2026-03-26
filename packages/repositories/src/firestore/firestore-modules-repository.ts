// ============================================================
// Implementación Firestore: ModulesRepository
// ============================================================

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
import type { ModuleDefinition } from '@terabound/domain';
import type { ModulesRepository } from '../contracts/modules-repository';

export class FirestoreModulesRepository implements ModulesRepository {
  private get col() {
    return collection(getFirebaseFirestore(), Collections.MODULES);
  }

  async getById(moduleId: string): Promise<ModuleDefinition | null> {
    const snap = await getDoc(doc(this.col, moduleId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...this.mapFromFirestore(snap.data()) };
  }

  async list(filters?: { status?: string; category?: string; visibility?: string }): Promise<ModuleDefinition[]> {
    const constraints = [];
    if (filters?.status) constraints.push(where('status', '==', filters.status));
    if (filters?.category) constraints.push(where('category', '==', filters.category));
    if (filters?.visibility) constraints.push(where('visibility', '==', filters.visibility));
    constraints.push(orderBy('sortOrder', 'asc'));

    const q = query(this.col, ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...this.mapFromFirestore(d.data()) }));
  }

  async create(input: Omit<ModuleDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(this.col, {
      ...input,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async update(moduleId: string, input: Partial<ModuleDefinition>): Promise<void> {
    const ref = doc(this.col, moduleId);
    await updateDoc(ref, {
      ...input,
      updatedAt: Timestamp.now(),
    });
  }

  async updateStatus(moduleId: string, status: string): Promise<void> {
    return this.update(moduleId, { status } as Partial<ModuleDefinition>);
  }

  private mapFromFirestore(data: Record<string, unknown>): Omit<ModuleDefinition, 'id'> {
    return {
      ...data,
      createdAt: (data['createdAt'] as Timestamp)?.toDate() ?? new Date(),
      updatedAt: (data['updatedAt'] as Timestamp)?.toDate() ?? new Date(),
    } as Omit<ModuleDefinition, 'id'>;
  }
}
