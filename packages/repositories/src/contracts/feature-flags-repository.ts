import type { FeatureFlag } from '@terabound/domain';

export interface FeatureFlagsRepository {
  getById(flagId: string): Promise<FeatureFlag | null>;
  getByKey(key: string): Promise<FeatureFlag | null>;
  list(filters?: { enabled?: boolean; scope?: string }): Promise<FeatureFlag[]>;
  create(input: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  update(flagId: string, input: Partial<FeatureFlag>): Promise<void>;
  toggle(flagId: string, enabled: boolean): Promise<void>;
}
