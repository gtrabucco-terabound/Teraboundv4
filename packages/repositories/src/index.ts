// ============================================================
// @terabound/repositories — Contratos e implementaciones
// Fuente: §15 de la spec ejecutable
// ============================================================

// Contratos (interfaces)
export type { ModulesRepository } from './contracts/modules-repository';
export type { PlatformConfigRepository } from './contracts/platform-config-repository';

// Implementaciones Firestore
export { FirestoreModulesRepository } from './firestore/firestore-modules-repository';
export { FirestorePlatformConfigRepository } from './firestore/firestore-platform-config-repository';
