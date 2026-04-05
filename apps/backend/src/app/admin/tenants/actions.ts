'use server';

import { FirestoreAdminTenantsRepository } from '@terabound/repositories/src/firestore/admin/firestore-admin-tenants-repository';
import type { Tenant } from '@terabound/domain';

const tenantsRepo = new FirestoreAdminTenantsRepository();

export async function getTenantsAction(): Promise<Tenant[]> {
  return await tenantsRepo.list();
}
