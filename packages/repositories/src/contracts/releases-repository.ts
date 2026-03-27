import type { ReleaseDefinition } from '@terabound/domain';

export interface ReleasesRepository {
  getById(releaseId: string): Promise<ReleaseDefinition | null>;
  list(filters?: { status?: string }): Promise<ReleaseDefinition[]>;
  create(input: Omit<ReleaseDefinition, 'id' | 'createdAt'>): Promise<string>;
  updateStatus(releaseId: string, status: string): Promise<void>;
}
