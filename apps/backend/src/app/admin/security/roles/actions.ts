'use server';

import { CreateRoleUseCase, UpdateRoleUseCase } from '@terabound/application';
import { FirestoreRolesRepository } from '@terabound/repositories';
import { AuditService, AuditEventFactory } from '@terabound/audit';
import { FirestoreAuditRepository } from '@terabound/repositories/src/firestore/firestore-audit-repository'; // Asumiendo que existe
import type { RoleDefinition, ActorContext } from '@terabound/domain';

// Inicialización de dependencias (Idealmente mediante inyección de dependencias)
const rolesRepo = new FirestoreRolesRepository();
// MOCK implementation for AuditRepo until a real one is hooked if missing
const mockAuditRepo = {
  logGlobal: async (e: any) => console.log('MOCK AUDIT GLOBAL', e),
  logTenant: async (t: string, e: any) => console.log('MOCK AUDIT TENANT', t, e),
};
const auditService = new AuditService(mockAuditRepo as any);
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

export async function getRolesAction(): Promise<RoleDefinition[]> {
  return await rolesRepo.listGlobal();
}
