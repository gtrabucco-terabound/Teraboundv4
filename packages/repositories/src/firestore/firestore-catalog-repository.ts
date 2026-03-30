// ============================================================
// Implementación Firestore: Catalogs & CatalogItems
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
  setDoc,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@terabound/firebase-client';
import { Collections } from '@terabound/config';
import type { Catalog, CatalogItem } from '@terabound/domain';
import type { CatalogsRepository, CatalogItemsRepository } from '../contracts/catalog-repository';

export class FirestoreCatalogsRepository implements CatalogsRepository {
  private get col() {
    return collection(getFirebaseFirestore(), Collections.CATALOGS);
  }

  async list(): Promise<Catalog[]> {
    const snap = await getDocs(query(this.col, orderBy('name', 'asc')));
    return snap.docs.map(d => ({ id: d.id, ...this.mapCatalog(d.data()) }));
  }

  async getById(id: string): Promise<Catalog | null> {
    const snap = await getDoc(doc(this.col, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...this.mapCatalog(snap.data()) };
  }

  async create(catalog: Omit<Catalog, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string> {
    const now = Timestamp.now();
    const { key, ...rest } = catalog;
    // Usamos el key como ID del documento si no existe, o dejamos que Firestore genere uno. 
    // §4.1 sugiere que el id es la clave técnica.
    const docRef = doc(this.col, key);
    await setDoc(docRef, {
      ...rest,
      key,
      createdAt: now,
      updatedAt: now,
    });
    return key;
  }

  async update(id: string, data: Partial<Catalog>): Promise<void> {
    await updateDoc(doc(this.col, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  }

  async toggleActive(id: string): Promise<void> {
    const catalog = await this.getById(id);
    if (!catalog) return;
    await this.update(id, { active: !catalog.active });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.col, id));
  }

  private mapCatalog(data: any): Omit<Catalog, 'id'> {
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Omit<Catalog, 'id'>;
  }
}

export class FirestoreCatalogItemsRepository implements CatalogItemsRepository {
  private get col() {
    return collection(getFirebaseFirestore(), Collections.CATALOG_ITEMS);
  }

  async listByCatalog(catalogId: string): Promise<CatalogItem[]> {
    // Eliminamos el orderBy a nivel de consulta para evitar requerir índices compuestos manuales.
    // Ordenamos en memoria para garantizar que los ítems sean visibles de inmediato.
    const q = query(this.col, where('catalogId', '==', catalogId));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...this.mapItem(d.data()) })) as CatalogItem[];
    
    return items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getById(id: string): Promise<CatalogItem | null> {
    const snap = await getDoc(doc(this.col, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...this.mapItem(snap.data()) };
  }

  async create(item: Omit<CatalogItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(this.col, {
      ...item,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async update(id: string, item: Partial<CatalogItem>): Promise<void> {
    await updateDoc(doc(this.col, id), {
      ...item,
      updatedAt: Timestamp.now(),
    });
  }

  async toggleActive(id: string): Promise<void> {
    const item = await this.getById(id);
    if (!item) return;
    await this.update(id, { active: !item.active });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.col, id));
  }

  private mapItem(data: any): Omit<CatalogItem, 'id'> {
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Omit<CatalogItem, 'id'>;
  }
}
