// ============================================================
// Contrato: PlatformConfigRepository
// ============================================================

import type { PlatformConfig } from '@terabound/domain';

export interface PlatformConfigRepository {
  getSharedConfig(): Promise<PlatformConfig | null>;
  updateSharedConfig(input: Partial<PlatformConfig>): Promise<void>;
}
