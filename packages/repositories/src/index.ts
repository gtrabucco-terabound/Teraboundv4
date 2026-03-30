// ============================================================
// @terabound/repositories — Contratos e implementaciones
// Fuente: §15 de la spec ejecutable
// ============================================================

// Contratos (interfaces)
export type { ModulesRepository } from './contracts/modules-repository';
export type { PlatformConfigRepository } from './contracts/platform-config-repository';
export type { FeatureFlagsRepository } from './contracts/feature-flags-repository';
export type { EnvironmentsRepository } from './contracts/environments-repository';
export type { ReleasesRepository } from './contracts/releases-repository';
export type { TenantsRepository } from './contracts/tenants-repository';
export type { TenantsModulesRepository } from './contracts/tenants-modules-repository';
export * from './contracts/security-repositories';

// Implementaciones Firestore
export { FirestoreModulesRepository } from './firestore/firestore-modules-repository';
export { FirestorePlatformConfigRepository } from './firestore/firestore-platform-config-repository';
export { FirestoreFeatureFlagsRepository } from './firestore/firestore-feature-flags-repository';
export { FirestoreEnvironmentsRepository } from './firestore/firestore-environments-repository';
export { FirestoreReleasesRepository } from './firestore/firestore-releases-repository';
export { FirestoreTenantsRepository } from './firestore/firestore-tenants-repository';
export { FirestoreTenantsModulesRepository } from './firestore/firestore-tenants-modules-repository';
export * from './firestore/firestore-users-repository';
export * from './firestore/firestore-memberships-repository';
export * from './firestore/firestore-roles-repository';
export * from './firestore/firestore-policies-repository';
export * from './seed/security-seed';

