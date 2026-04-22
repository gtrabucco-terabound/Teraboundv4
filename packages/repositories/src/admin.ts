// ============================================================
// @terabound/repositories/admin — Entry point para Repositorios Server-Only
// Este archivo SOLO debe ser importado en Server Actions, Route Handlers
// o funciones ejecutadas en entorno Node.js (Servidor).
// Depende de @terabound/firebase-admin (Node-only).
// ============================================================

export { FirestoreAdminUsersRepository } from './firestore/admin/firestore-admin-users-repository';
export { FirestoreAdminMembershipsRepository } from './firestore/admin/firestore-admin-memberships-repository';
export { FirestoreAdminRolesRepository } from './firestore/admin/firestore-admin-roles-repository';
export { FirestoreAdminTenantsRepository } from './firestore/admin/firestore-admin-tenants-repository';
export { FirestoreAdminAuditRepository } from './firestore/admin/firestore-admin-audit-repository';
export { FirestoreAdminIncidentsRepository } from './firestore/admin/firestore-admin-incidents-repository';
