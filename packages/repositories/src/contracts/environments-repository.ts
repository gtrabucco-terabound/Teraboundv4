import type { EnvironmentConfig } from '@terabound/domain';

export interface EnvironmentsRepository {
  getById(envId: string): Promise<EnvironmentConfig | null>;
  list(): Promise<EnvironmentConfig[]>;
  update(envId: string, input: Partial<EnvironmentConfig>): Promise<void>;
}
