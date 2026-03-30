// ============================================================
// Implementación Firestore: Navigation & NavigationItems
// ============================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@terabound/firebase-client';
import { Collections } from '@terabound/config';
import type { NavigationSchema, NavigationItem } from '@terabound/domain';
import type { NavigationRepository, NavigationItemsRepository } from '../contracts/navigation-repository';

export class FirestoreNavigationRepository implements NavigationRepository {
  private get col() {
    return collection(getFirebaseFirestore(), Collections.NAVIGATION);
  }

  async list(): Promise<NavigationSchema[]> {
    const snap = await getDocs(this.col);
    return snap.docs.map(d => ({ id: d.id, ...this.mapSchema(d.data()) }));
  }

  async getById(id: string): Promise<NavigationSchema | null> {
    const snap = await getDoc(doc(this.col, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...this.mapSchema(snap.data()) };
  }

  async getByKey(key: string): Promise<NavigationSchema | null> {
    const q = query(this.col, where('key', '==', key));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    if (!d) return null;
    return { id: d.id, ...this.mapSchema(d.data()) };
  }

  async create(schema: Omit<NavigationSchema, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(this.col, {
      ...schema,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<NavigationSchema>): Promise<void> {
    await updateDoc(doc(this.col, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.col, id));
  }

  private mapSchema(data: any): Omit<NavigationSchema, 'id'> {
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Omit<NavigationSchema, 'id'>;
  }
}

export class FirestoreNavigationItemsRepository implements NavigationItemsRepository {
  private get col() {
    return collection(getFirebaseFirestore(), Collections.NAVIGATION_ITEMS);
  }

  async listByNav(navId: string): Promise<NavigationItem[]> {
    const q = query(this.col, where('navId', '==', navId), orderBy('sortOrder', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...this.mapItem(d.data()) }));
  }

  async getById(id: string): Promise<NavigationItem | null> {
    const snap = await getDoc(doc(this.col, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...this.mapItem(snap.data()) };
  }

  async create(item: Omit<NavigationItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(this.col, {
      ...item,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<NavigationItem>): Promise<void> {
    await updateDoc(doc(this.col, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.col, id));
  }

  async reorder(id: string, sortOrder: number): Promise<void> {
    await this.update(id, { sortOrder });
  }

  private mapItem(data: any): Omit<NavigationItem, 'id'> {
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Omit<NavigationItem, 'id'>;
  }
}
