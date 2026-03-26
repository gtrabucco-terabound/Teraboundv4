// ============================================================
// Implementación Firestore: PlatformConfigRepository
// ============================================================

import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '@terabound/firebase-client';
import { Collections } from '@terabound/config';
import type { PlatformConfig } from '@terabound/domain';
import type { PlatformConfigRepository } from '../contracts/platform-config-repository';

const SHARED_CONFIG_ID = 'firebase_shared';

export class FirestorePlatformConfigRepository implements PlatformConfigRepository {
  private get docRef() {
    return doc(getFirebaseFirestore(), Collections.PLATFORM_CONFIG, SHARED_CONFIG_ID);
  }

  async getSharedConfig(): Promise<PlatformConfig | null> {
    const snap = await getDoc(this.docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      ...data,
      updatedAt: (data['updatedAt'] as Timestamp)?.toDate() ?? new Date(),
    } as PlatformConfig;
  }

  async updateSharedConfig(input: Partial<PlatformConfig>): Promise<void> {
    await setDoc(
      this.docRef,
      {
        ...input,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
  }
}
