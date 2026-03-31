// ============================================================
// Implementación Firestore: Data Governance
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
import type { EntityDefinition, RelationshipDefinition, ValidationRule } from '@terabound/domain';
import type { 
  EntitiesRepository, 
  RelationshipsRepository, 
  ValidationRulesRepository 
} from '../contracts/governance-repository';

export class FirestoreEntitiesRepository implements EntitiesRepository {
  private get col() {
    return collection(getFirebaseFirestore(), Collections.ENTITIES);
  }

  async list(): Promise<EntityDefinition[]> {
    const snap = await getDocs(query(this.col, orderBy('key', 'asc')));
    return snap.docs.map(d => ({ id: d.id, ...this.mapEntity(d.data()) }));
  }

  async getByKey(key: string): Promise<EntityDefinition | null> {
    const snap = await getDoc(doc(this.col, key));
    if (!snap.exists()) return null;
    return { id: snap.id, ...this.mapEntity(snap.data()) };
  }

  async create(entity: Omit<EntityDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const { key, ...rest } = entity;
    const docRef = doc(this.col, key);
    await setDoc(docRef, {
      ...rest,
      key,
      createdAt: now,
      updatedAt: now,
    });
    return key;
  }

  async update(id: string, entity: Partial<EntityDefinition>): Promise<void> {
    await updateDoc(doc(this.col, id), {
      ...entity,
      updatedAt: Timestamp.now(),
    });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.col, id));
  }

  async toggleActive(id: string): Promise<void> {
    const snap = await getDoc(doc(this.col, id));
    if (!snap.exists()) return;
    const data = snap.data();
    await this.update(id, { isActive: !data.isActive });
  }

  private mapEntity(data: any): Omit<EntityDefinition, 'id'> {
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Omit<EntityDefinition, 'id'>;
  }
}

export class FirestoreRelationshipsRepository implements RelationshipsRepository {
  private get col() {
    return collection(getFirebaseFirestore(), Collections.RELATIONSHIPS);
  }

  async list(): Promise<RelationshipDefinition[]> {
    const snap = await getDocs(this.col);
    return snap.docs.map(d => ({ id: d.id, ...this.mapRelation(d.data()) }));
  }

  async listBySource(entityKey: string): Promise<RelationshipDefinition[]> {
    const q = query(this.col, where('sourceEntityKey', '==', entityKey));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...this.mapRelation(d.data()) }));
  }

  async create(relation: Omit<RelationshipDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(this.col, {
      ...relation,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async update(id: string, relation: Partial<RelationshipDefinition>): Promise<void> {
    await updateDoc(doc(this.col, id), {
      ...relation,
      updatedAt: Timestamp.now(),
    });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.col, id));
  }

  async toggleActive(id: string): Promise<void> {
    const snap = await getDoc(doc(this.col, id));
    if (!snap.exists()) return;
    const data = snap.data();
    await this.update(id, { isActive: !data.isActive });
  }

  private mapRelation(data: any): Omit<RelationshipDefinition, 'id'> {
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Omit<RelationshipDefinition, 'id'>;
  }
}

export class FirestoreValidationRulesRepository implements ValidationRulesRepository {
  private get col() {
    return collection(getFirebaseFirestore(), Collections.VALIDATION_RULES);
  }

  async listByEntity(entityKey: string): Promise<ValidationRule[]> {
    const q = query(this.col, where('entityKey', '==', entityKey));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...this.mapRule(d.data()) }));
  }

  async create(rule: Omit<ValidationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(this.col, {
      ...rule,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async update(id: string, rule: Partial<ValidationRule>): Promise<void> {
    await updateDoc(doc(this.col, id), {
      ...rule,
      updatedAt: Timestamp.now(),
    });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.col, id));
  }

  async toggleActive(id: string): Promise<void> {
    const snap = await getDoc(doc(this.col, id));
    if (!snap.exists()) return;
    const data = snap.data();
    await this.update(id, { isActive: !data.isActive });
  }

  private mapRule(data: any): Omit<ValidationRule, 'id'> {
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Omit<ValidationRule, 'id'>;
  }
}
