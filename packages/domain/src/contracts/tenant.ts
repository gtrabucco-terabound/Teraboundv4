// ============================================================
// Contratos Tenant — §5.2 (colecciones tenant-scoped)
// ============================================================

import type { TenantStatus, MembershipStatus } from './enums';

export interface TenantBranding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

/** tenants/{tenantId} */
export interface Tenant {
  id?: string;
  legalName: string;
  tradeName?: string;
  taxId?: string;
  status: TenantStatus;
  timezone: string;
  locale: string;
  currency: string;
  country?: string;
  ownerUserId: string;
  planId?: string;
  branding?: TenantBranding;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  deletedAt?: Date;
}

/** tenants/{tenantId}/members/{membershipId} */
export interface Membership {
  id?: string;
  userId: string;
  roleId: string;
  status: MembershipStatus;
  moduleAccess: string[];
  departmentId?: string;
  invitedBy: string;
  invitedAt?: Date;
  activatedAt?: Date;
  lastAccessAt?: Date;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

/** tenants/{tenantId}/_tn_modules/{moduleId} */
export interface TenantModule {
  id?: string;
  moduleId: string;
  status: 'enabled' | 'disabled' | 'maintenance';
  enabledAt?: Date;
  config?: Record<string, unknown>;
  limits?: Record<string, number>;
  updatedAt: Date;
  updatedBy: string;
}

/** tenants/{tenantId}/_tn_settings/{settingId} */
export interface TenantSetting {
  id?: string;
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'json';
  category?: string;
  updatedAt: Date;
  updatedBy: string;
}

/** tenants/{tenantId}/_tn_navigation_overrides/{overrideId} */
export interface TenantNavigationOverride {
  id?: string;
  itemId: string;
  action: 'hide' | 'rename' | 'reorder';
  value: unknown;
  updatedAt: Date;
  updatedBy: string;
}

/** tenants/{tenantId}/_tn_event_log/{eventId} */
export interface TenantEventLog {
  id?: string;
  eventType: string;
  moduleId?: string;
  entityType: string;
  entityId: string;
  actorUserId: string;
  payload?: Record<string, unknown>;
  createdAt: Date;
}
