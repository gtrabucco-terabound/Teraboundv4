import { getFirestoreAdmin } from '@terabound/firebase-admin';
import type { UserRecord } from '@terabound/domain';
import type { UsersRepository } from '../../contracts/security-repositories';

export class FirestoreAdminUsersRepository implements UsersRepository {
  private collection = 'users';

  async list(): Promise<UserRecord[]> {
    const db = getFirestoreAdmin();
    const snapshot = await db.collection(this.collection).get();
    return snapshot.docs.map(doc => this.sanitize({ id: doc.id, ...doc.data() }));
  }

  async getById(id: string): Promise<UserRecord | null> {
    const db = getFirestoreAdmin();
    const snap = await db.collection(this.collection).doc(id).get();
    if (!snap.exists) return null;
    return this.sanitize({ id: snap.id, ...snap.data() });
  }

  async create(user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string> {
    const db = getFirestoreAdmin();
    const docRef = await db.collection(this.collection).add({
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<UserRecord>): Promise<void> {
    const db = getFirestoreAdmin();
    await db.collection(this.collection).doc(id).update({
      ...data,
      updatedAt: new Date()
    });
  }

  private sanitize(data: any): UserRecord {
    if (!data) return data;
    const result = { ...data };
    if (result.createdAt?.toDate) result.createdAt = result.createdAt.toDate().toISOString();
    if (result.updatedAt?.toDate) result.updatedAt = result.updatedAt.toDate().toISOString();
    if (result.lastAccessAt?.toDate) result.lastAccessAt = result.lastAccessAt.toDate().toISOString();
    return result as UserRecord;
  }
}
