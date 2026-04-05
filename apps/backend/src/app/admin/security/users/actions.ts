'use server';

import { FirestoreAdminUsersRepository } from '@terabound/repositories/src/firestore/admin/firestore-admin-users-repository';
import { FirestoreAdminAuditRepository } from '@terabound/repositories/src/firestore/admin/firestore-admin-audit-repository';
import { AuditService } from '@terabound/audit';
import type { UserRecord, ActorContext } from '@terabound/domain';

const usersRepo = new FirestoreAdminUsersRepository();
const auditRepo = new FirestoreAdminAuditRepository();
const auditService = new AuditService(auditRepo);

const MOCK_ACTOR: ActorContext = {
  actorUserId: 'admin-123',
  actorType: 'user',
  source: 'ui',
};

export async function getUsersAction(): Promise<UserRecord[]> {
  return await usersRepo.list();
}

export async function createUserAction(
  data: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt' | 'lastAccessAt' | 'createdBy' | 'updatedBy'>
): Promise<string> {
  const id = await usersRepo.create({
    ...data,
    globalType: data.globalType || 'standard',
    status: 'active'
  });

  await auditService.logGlobal({
    eventType: 'SECURITY_USER_CREATED',
    entityId: id,
    entityType: 'user',
    actorUserId: MOCK_ACTOR.actorUserId,
    actorType: MOCK_ACTOR.actorType,
    action: 'CREATE',
    source: MOCK_ACTOR.source,
    severity: 'info',
    status: 'success',
    payload: { email: data.email } as any
  });

  return id;
}

export async function updateUserAction(id: string, data: Partial<UserRecord>): Promise<void> {
  await usersRepo.update(id, data);
  
  await auditService.logGlobal({
    eventType: 'SECURITY_USER_UPDATED',
    entityId: id,
    entityType: 'user',
    actorUserId: MOCK_ACTOR.actorUserId,
    actorType: MOCK_ACTOR.actorType,
    action: 'UPDATE',
    source: MOCK_ACTOR.source,
    severity: 'info',
    status: 'success',
    payload: data as any
  });
}

export async function toggleUserStatusAction(id: string, active: boolean): Promise<void> {
  const status = active ? 'active' : 'blocked';
  await usersRepo.update(id, { status });
  
  await auditService.logGlobal({
    eventType: active ? 'SECURITY_USER_ACTIVATED' : 'SECURITY_USER_DEACTIVATED',
    entityId: id,
    entityType: 'user',
    actorUserId: MOCK_ACTOR.actorUserId,
    actorType: MOCK_ACTOR.actorType,
    action: 'TOGGLE_STATUS',
    source: MOCK_ACTOR.source,
    severity: 'warning',
    status: 'success'
  });
}
