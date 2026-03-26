// ============================================================
// Enums y constantes — derivados de §5 y §7 de la spec ejecutable
// ============================================================

export const UserStatus = {
  INVITED: 'invited',
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  DISABLED: 'disabled',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const GlobalType = {
  PLATFORM_ADMIN: 'platform_admin',
  STANDARD: 'standard',
} as const;
export type GlobalType = (typeof GlobalType)[keyof typeof GlobalType];

export const TenantStatus = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
} as const;
export type TenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus];

export const ModuleStatus = {
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  DEPRECATED: 'deprecated',
  DRAFT: 'draft',
} as const;
export type ModuleStatus = (typeof ModuleStatus)[keyof typeof ModuleStatus];

export const ModuleCategory = {
  CORE: 'core',
  MICRO_APP: 'micro-app',
  SYSTEM: 'system',
} as const;
export type ModuleCategory = (typeof ModuleCategory)[keyof typeof ModuleCategory];

export const ModuleType = {
  BACKEND: 'backend',
  HUB: 'hub',
  CRM: 'crm',
  FINANZAS: 'finanzas',
  WORK_ORDERS: 'work-orders',
  LOGISTICA_INVENTARIOS: 'logistica-inventarios',
  RRHH: 'rrhh',
} as const;
export type ModuleType = (typeof ModuleType)[keyof typeof ModuleType];

export const MembershipStatus = {
  INVITED: 'invited',
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  REVOKED: 'revoked',
} as const;
export type MembershipStatus = (typeof MembershipStatus)[keyof typeof MembershipStatus];

export const JobStatus = {
  QUEUED: 'queued',
  RUNNING: 'running',
  FAILED: 'failed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export const ErrorSeverity = {
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const;
export type ErrorSeverity = (typeof ErrorSeverity)[keyof typeof ErrorSeverity];

export const IncidentSeverity = {
  MINOR: 'minor',
  MAJOR: 'major',
  CRITICAL: 'critical',
} as const;
export type IncidentSeverity = (typeof IncidentSeverity)[keyof typeof IncidentSeverity];

export const IncidentStatus = {
  OPEN: 'open',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
} as const;
export type IncidentStatus = (typeof IncidentStatus)[keyof typeof IncidentStatus];

export const Severity = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
} as const;
export type Severity = (typeof Severity)[keyof typeof Severity];

export const Cardinality = {
  ONE_TO_ONE: '1:1',
  ONE_TO_MANY: '1:N',
  MANY_TO_MANY: 'N:N',
} as const;
export type Cardinality = (typeof Cardinality)[keyof typeof Cardinality];

export const RelationshipStrategy = {
  REFERENCE: 'reference',
  PROJECTION: 'projection',
  EVENT_DRIVEN: 'event-driven',
} as const;
export type RelationshipStrategy = (typeof RelationshipStrategy)[keyof typeof RelationshipStrategy];

export const CascadePolicy = {
  NONE: 'none',
  RESTRICT: 'restrict',
  SOFT_DELETE: 'soft-delete',
} as const;
export type CascadePolicy = (typeof CascadePolicy)[keyof typeof CascadePolicy];
