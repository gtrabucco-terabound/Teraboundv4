// ============================================================
// Contratos Platform — §5.1 (colecciones globales de plataforma)
// ============================================================

import type { ModuleStatus, ModuleCategory, ModuleType } from './enums';

/** _gl_platform_config/firebase_shared */
export interface PlatformConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appCheckSiteKey?: string;
  defaultRegion?: string;
  updatedAt: Date;
  updatedBy: string;
  version: number;
}

/** _gl_modules/{moduleId} */
export interface ModuleDefinition {
  id?: string;
  slug: string;
  name: string;
  description?: string;
  category: ModuleCategory;
  type: ModuleType;
  firebaseAppId: string;
  remoteUrl?: string;
  icon?: string;
  status: ModuleStatus;
  visibility: 'internal' | 'tenant-available';
  dependencies: string[];
  sortOrder: number;
  version: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

/** _gl_feature_flags/{flagId} */
export interface FeatureFlag {
  id?: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  scope: 'platform' | 'tenant' | 'module';
  targetModules?: string[];
  targetTenants?: string[];
  rolloutPercentage?: number;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

/** _gl_environments/{envId} */
export interface EnvironmentConfig {
  id?: string;
  name: 'dev' | 'staging' | 'prod';
  status: 'active' | 'inactive';
  configVersion: number;
  notes?: string;
  updatedAt: Date;
  updatedBy: string;
}

/** _gl_releases/{releaseId} */
export interface ReleaseDefinition {
  id?: string;
  name: string;
  version: string;
  targetModules: string[];
  status: 'planned' | 'in-progress' | 'released' | 'rolled-back';
  releasedAt?: Date;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

/** _gl_security_policies/{policyId} */
export interface SecurityPolicy {
  id?: string;
  key: string;
  name: string;
  description?: string;
  type: 'auth' | 'session' | 'network' | 'support';
  enabled: boolean;
  config: Record<string, unknown>;
  updatedAt: Date;
  updatedBy: string;
}
