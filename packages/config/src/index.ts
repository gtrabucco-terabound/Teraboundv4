// ============================================================
// @terabound/config — Constantes globales del ecosistema
// Fuente: §7 (Permisos), §8 (Roles), §18 (Seeds)
// ============================================================

// ---- COLECCIONES FIRESTORE ----
export const Collections = {
  // Globales
  USERS: 'users',
  PLATFORM_CONFIG: '_gl_platform_config',
  MODULES: '_gl_modules',
  FEATURE_FLAGS: '_gl_feature_flags',
  ENVIRONMENTS: '_gl_environments',
  RELEASES: '_gl_releases',
  SECURITY_POLICIES: '_gl_security_policies',
  NAVIGATION: '_gl_navigation',
  NAVIGATION_ITEMS: '_gl_navigation_items',
  CATALOGS: '_gl_catalogs',
  CATALOG_ITEMS: '_gl_catalog_items',
  ENTITIES: '_gl_entities',
  RELATIONSHIPS: '_gl_relationships',
  VALIDATION_RULES: '_gl_validation_rules',
  REFERENCE_MODELS: '_gl_reference_models',
  AUDIT_LOG: '_gl_audit_log',
  EVENT_CATALOG: '_gl_event_catalog',
  JOBS: '_gl_jobs',
  ERRORS: '_gl_errors',
  INCIDENTS: '_gl_incidents',
  AUTOMATION_RULES: '_gl_automation_rules',
  METRICS: '_gl_metrics',

  // Tenant-scoped
  TENANTS: 'tenants',
  // Subcolecciones del tenant:
  MEMBERS: 'members',
  TENANT_ROLES: '_tn_roles',
  TENANT_MODULES: '_tn_modules',
  TENANT_SETTINGS: '_tn_settings',
  TENANT_NAV_OVERRIDES: '_tn_navigation_overrides',
  TENANT_EVENT_LOG: '_tn_event_log',
} as const;

// ---- PERMISOS OBLIGATORIOS (§7.4) ----
export const Permissions = {
  // Platform
  PLATFORM_CONFIG_READ: 'platform.config.read',
  PLATFORM_CONFIG_MANAGE: 'platform.config.manage',
  PLATFORM_MODULES_READ: 'platform.modules.read',
  PLATFORM_MODULES_MANAGE: 'platform.modules.manage',
  PLATFORM_FEATURES_READ: 'platform.features.read',
  PLATFORM_FEATURES_MANAGE: 'platform.features.manage',
  PLATFORM_ENVIRONMENTS_READ: 'platform.environments.read',
  PLATFORM_ENVIRONMENTS_MANAGE: 'platform.environments.manage',
  PLATFORM_RELEASES_READ: 'platform.releases.read',
  PLATFORM_RELEASES_MANAGE: 'platform.releases.manage',

  // Tenant
  TENANT_DIRECTORY_READ: 'tenant.directory.read',
  TENANT_DIRECTORY_MANAGE: 'tenant.directory.manage',
  TENANT_MODULES_READ: 'tenant.modules.read',
  TENANT_MODULES_MANAGE: 'tenant.modules.manage',
  TENANT_SETTINGS_READ: 'tenant.settings.read',
  TENANT_SETTINGS_MANAGE: 'tenant.settings.manage',

  // Users & Memberships
  TENANT_USERS_READ: 'tenant.users.read',
  TENANT_USERS_INVITE: 'tenant.users.invite',
  TENANT_USERS_UPDATE: 'tenant.users.update',
  TENANT_USERS_BLOCK: 'tenant.users.block',
  TENANT_MEMBERSHIPS_READ: 'tenant.memberships.read',
  TENANT_MEMBERSHIPS_MANAGE: 'tenant.memberships.manage',

  // Roles & Permissions
  TENANT_ROLES_READ: 'tenant.roles.read',
  TENANT_ROLES_CREATE: 'tenant.roles.create',
  TENANT_ROLES_UPDATE: 'tenant.roles.update',
  TENANT_ROLES_DELETE: 'tenant.roles.delete',
  TENANT_ROLES_MANAGE: 'tenant.roles.manage',
  TENANT_PERMISSIONS_READ: 'tenant.permissions.read',
  TENANT_PERMISSIONS_MANAGE: 'tenant.permissions.manage',

  // Navigation
  NAVIGATION_SCHEMAS_READ: 'navigation.schemas.read',
  NAVIGATION_SCHEMAS_MANAGE: 'navigation.schemas.manage',
  NAVIGATION_MENUS_READ: 'navigation.menus.read',
  NAVIGATION_MENUS_MANAGE: 'navigation.menus.manage',

  // Master Data
  MASTER_CATALOGS_READ: 'master.catalogs.read',
  MASTER_CATALOGS_MANAGE: 'master.catalogs.manage',

  // Data Governance
  DATA_ENTITIES_READ: 'data.entities.read',
  DATA_ENTITIES_MANAGE: 'data.entities.manage',
  DATA_RELATIONSHIPS_READ: 'data.relationships.read',
  DATA_RELATIONSHIPS_MANAGE: 'data.relationships.manage',
  DATA_VALIDATION_READ: 'data.validation.read',
  DATA_VALIDATION_MANAGE: 'data.validation.manage',

  // Audit
  AUDIT_LOGS_READ: 'audit.logs.read',
  AUDIT_LOGS_EXPORT: 'audit.logs.export',
  AUDIT_EVENTS_READ: 'audit.events.read',

  // Operations
  OPS_JOBS_READ: 'ops.jobs.read',
  OPS_JOBS_MANAGE: 'ops.jobs.manage',
  OPS_ERRORS_READ: 'ops.errors.read',
  OPS_ERRORS_MANAGE: 'ops.errors.manage',
  OPS_INCIDENTS_READ: 'ops.incidents.read',
  OPS_INCIDENTS_MANAGE: 'ops.incidents.manage',
  OPS_SUPPORT_IMPERSONATE: 'ops.support.impersonate',

  // Automation
  AUTOMATION_RULES_READ: 'automation.rules.read',
  AUTOMATION_RULES_MANAGE: 'automation.rules.manage',

  // Analytics
  ANALYTICS_PLATFORM_READ: 'analytics.platform.read',
  ANALYTICS_USAGE_READ: 'analytics.usage.read',
} as const;

// ---- ROLES SISTEMA BASE (§8 / §18) ----
export const SystemRoles = {
  PLATFORM_ADMIN: 'PlatformAdmin',
  TENANT_ADMIN: 'TenantAdmin',
  SECURITY_ADMIN: 'SecurityAdmin',
  SUPPORT_OPERATOR: 'SupportOperator',
  READONLY_AUDITOR: 'ReadOnlyAuditor',
} as const;

// ---- MÓDULOS BASE (§18) ----
export const BaseModules = [
  { slug: 'backend', name: 'Backend Admin', category: 'core', type: 'backend' },
  { slug: 'hub', name: 'Hub', category: 'core', type: 'hub' },
  { slug: 'crm', name: 'CRM', category: 'micro-app', type: 'crm' },
  { slug: 'finanzas', name: 'Finanzas', category: 'micro-app', type: 'finanzas' },
  { slug: 'work-orders', name: 'Órdenes de Trabajo', category: 'micro-app', type: 'work-orders' },
  { slug: 'logistica-inventarios', name: 'Logística & Inventarios', category: 'micro-app', type: 'logistica-inventarios' },
  { slug: 'rrhh', name: 'RRHH', category: 'micro-app', type: 'rrhh' },
] as const;

// ---- CATÁLOGOS BASE (§18) ----
export const BaseCatalogs = [
  'countries',
  'currencies',
  'locales',
  'module-categories',
  'tenant-status',
  'user-status',
  'severity-levels',
] as const;
