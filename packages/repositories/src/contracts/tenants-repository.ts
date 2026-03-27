import type { Tenant } from '@terabound/domain';

export interface TenantsRepository {
  list(): Promise<Tenant[]>;
  getById(id: string): Promise<Tenant | null>;
  create(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string>;
  update(id: string, data: Partial<Tenant>): Promise<void>;
  delete(id: string): Promise<void>;
}
