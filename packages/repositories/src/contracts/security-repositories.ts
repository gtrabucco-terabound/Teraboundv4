import type { UserRecord, Membership, RoleDefinition, SecurityPolicy } from '@terabound/domain';

export interface UsersRepository {
  list(): Promise<UserRecord[]>;
  getById(id: string): Promise<UserRecord | null>;
  create(user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string>;
  update(id: string, data: Partial<UserRecord>): Promise<void>;
}

export interface MembershipsRepository {
  listByTenant(tenantId: string): Promise<Membership[]>;
  listByUser(userId: string): Promise<Membership[]>;
  getById(tenantId: string, membershipId: string): Promise<Membership | null>;
  create(tenantId: string, membership: Omit<Membership, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string>;
  update(tenantId: string, membershipId: string, data: Partial<Membership>): Promise<void>;
  delete(tenantId: string, membershipId: string): Promise<void>;
}

export interface RolesRepository {
  listGlobal(): Promise<RoleDefinition[]>;
  listByTenant(tenantId: string): Promise<RoleDefinition[]>;
  getById(id: string, tenantId?: string): Promise<RoleDefinition | null>;
  create(role: Omit<RoleDefinition, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>, tenantId?: string): Promise<string>;
  update(id: string, data: Partial<RoleDefinition>, tenantId?: string): Promise<void>;
}

export interface SecurityPoliciesRepository {
  list(): Promise<SecurityPolicy[]>;
  getByKey(key: string): Promise<SecurityPolicy | null>;
  update(key: string, data: Partial<SecurityPolicy>): Promise<void>;
}
