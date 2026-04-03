// ============================================================
// @terabound/domain — Contratos TypeScript Core
// Fuente de verdad: backen_admin_especificacion_tecnica_ejecutable §14
// ============================================================

// Core Context
export type { 
  TenantContext, 
  AuthenticatedUser, 
  UserRecord, 
  AuditEvent,
  AuditStatus,
  AuditSource,
  AuditSeverity,
  ActorContext
} from './contracts/tenant-context';


// Platform
export type {
  PlatformConfig,
  ModuleDefinition,
  FeatureFlag,
  EnvironmentConfig,
  ReleaseDefinition,
  SecurityPolicy,
} from './contracts/platform';

// Tenant
export type {
  Tenant,
  TenantBranding,
  Membership,
  TenantModule,
  TenantSetting,
  TenantNavigationOverride,
  TenantEventLog,
} from './contracts/tenant';

// Roles & Permissions
export type { RoleDefinition, PermissionScope } from './contracts/roles';

// Navigation
export type { NavigationSchema, NavigationItem } from './contracts/navigation';

// Governance
export type {
  EntityDefinition,
  RelationshipDefinition,
  ValidationRule,
  ReferenceModel,
} from './contracts/governance';

// Master Data
export type { Catalog, CatalogItem } from './contracts/master-data';

// Operations
export type { Job, ErrorRecord, Incident } from './contracts/operations';

// Automation
export type { AutomationRule } from './contracts/automation';

// Analytics
export type { Metric } from './contracts/analytics';

// Events
export type { EventCatalogEntry } from './contracts/events';
export type { AuditRepository } from './contracts/audit-repository';

// Enums & Constants
export {
  UserStatus,
  GlobalType,
  TenantStatus,
  ModuleStatus,
  ModuleCategory,
  ModuleType,
  MembershipStatus,
  JobStatus,
  ErrorSeverity,
  IncidentSeverity,
  IncidentStatus,
  Severity,
  Cardinality,
  RelationshipStrategy,
  CascadePolicy,
} from './contracts/enums';
