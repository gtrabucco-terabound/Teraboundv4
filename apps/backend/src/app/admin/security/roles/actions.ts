'use server';

import { CreateRoleUseCase, UpdateRoleUseCase } from '@terabound/application';
import { FirestoreAdminRolesRepository } from '@terabound/repositories/src/firestore/admin/firestore-admin-roles-repository';
import { FirestoreAdminAuditRepository } from '@terabound/repositories/src/firestore/admin/firestore-admin-audit-repository';
import { AuditService, AuditEventFactory } from '@terabound/audit';
import type { RoleDefinition, ActorContext } from '@terabound/domain';

// Inicialización de dependencias (Idealmente mediante inyección de dependencias)
// Inicialización de dependencias configuradas para servidor (Admin)
const rolesRepo = new FirestoreAdminRolesRepository();
const auditRepo = new FirestoreAdminAuditRepository();
const auditService = new AuditService(auditRepo);
const createRoleUseCase = new CreateRoleUseCase(rolesRepo, auditService);
const updateRoleUseCase = new UpdateRoleUseCase(rolesRepo, auditService);

// Mock ActorContext (Debería extraerse del contexto de sesión actual del usuario)
const MOCK_ACTOR: ActorContext = {
  actorUserId: 'admin-123',
  actorType: 'user',
  source: 'ui',
};

export async function createRoleAction(
  data: Omit<RoleDefinition, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>,
  tenantId?: string
): Promise<string> {
  return await createRoleUseCase.execute({
    role: data,
    tenantId,
    actor: MOCK_ACTOR,
  });
}

export async function updateRoleAction(
  roleId: string,
  data: Partial<Omit<RoleDefinition, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>>,
  tenantId?: string
): Promise<void> {
  await updateRoleUseCase.execute({
    roleId,
    data,
    tenantId,
    actor: MOCK_ACTOR,
  });
}

export async function getRolesAction(tenantId?: string): Promise<RoleDefinition[]> {
  if (tenantId) {
    return await rolesRepo.listByTenant(tenantId);
  }
  return await rolesRepo.listGlobal();
}
