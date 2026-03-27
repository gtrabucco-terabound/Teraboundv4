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

// Implementaciones Firestore
export { FirestoreModulesRepository } from './firestore/firestore-modules-repository';
export { FirestorePlatformConfigRepository } from './firestore/firestore-platform-config-repository';
export { FirestoreFeatureFlagsRepository } from './firestore/firestore-feature-flags-repository';
export { FirestoreEnvironmentsRepository } from './firestore/firestore-environments-repository';
export { FirestoreReleasesRepository } from './firestore/firestore-releases-repository';
