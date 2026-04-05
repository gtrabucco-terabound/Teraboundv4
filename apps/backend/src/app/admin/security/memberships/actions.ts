'use server';

import { FirestoreAdminMembershipsRepository } from '@terabound/repositories/src/firestore/admin/firestore-admin-memberships-repository';
import { FirestoreAdminTenantsRepository } from '@terabound/repositories/src/firestore/admin/firestore-admin-tenants-repository';
import { FirestoreAdminAuditRepository } from '@terabound/repositories/src/firestore/admin/firestore-admin-audit-repository';
import { AuditService } from '@terabound/audit';
import type { Membership, ActorContext } from '@terabound/domain';

const membershipsRepo = new FirestoreAdminMembershipsRepository();
const tenantsRepo = new FirestoreAdminTenantsRepository();
const auditRepo = new FirestoreAdminAuditRepository();
const auditService = new AuditService(auditRepo);

const MOCK_ACTOR: ActorContext = {
  actorUserId: 'admin-123',
  actorType: 'user',
  source: 'ui',
};

export async function getGlobalMembershipsAction(): Promise<{ memberships: Membership[], tenants: Record<string, string> }> {
  // Cargamos los tenants para el mapeo de nombres
  const tenantData = await tenantsRepo.list();
  const tenantMap: Record<string, string> = {};
  tenantData.forEach(t => { if(t.id) tenantMap[t.id] = t.legalName; });

  // Cargamos membresías de todos los tenants identificados
  let allMembers: Membership[] = [];
  for (const tId of Object.keys(tenantMap)) {
     const ms = await membershipsRepo.listByTenant(tId);
     allMembers = [...allMembers, ...ms.map(m => ({ ...m, tenantId: tId } as any))];
  }

  return { memberships: allMembers, tenants: tenantMap };
}

export async function revokeMembershipAction(tenantId: string, membershipId: string): Promise<void> {
  await membershipsRepo.revoke(tenantId, membershipId);
  
  await auditService.logTenant(tenantId, {
    eventType: 'MEMBERSHIP_REVOKED',
    entityId: membershipId,
    entityType: 'membership',
    actorUserId: MOCK_ACTOR.actorUserId,
    moduleId: 'security',
    payload: { tenantId, severity: 'critical' }
  });
}

export async function changeMembershipRoleAction(tenantId: string, membershipId: string, newRoleId: string): Promise<void> {
  await membershipsRepo.changeRole(tenantId, membershipId, newRoleId);
  
  await auditService.logTenant(tenantId, {
    eventType: 'MEMBERSHIP_ROLE_CHANGED',
    entityId: membershipId,
    entityType: 'membership',
    actorUserId: MOCK_ACTOR.actorUserId,
    moduleId: 'security',
    payload: { newRoleId, severity: 'warning' }
  });
}
