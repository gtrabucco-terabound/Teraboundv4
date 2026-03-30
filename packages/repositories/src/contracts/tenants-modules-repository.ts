import type { TenantModule } from '@terabound/domain';

export interface TenantsModulesRepository {
  list(tenantId: string): Promise<TenantModule[]>;
  getByModuleId(tenantId: string, moduleId: string): Promise<TenantModule | null>;
  upsert(tenantId: string, data: Omit<TenantModule, 'updatedAt' | 'updatedBy'>): Promise<void>;
  delete(tenantId: string, moduleId: string): Promise<void>;
}
