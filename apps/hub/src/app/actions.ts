'use server';

import { cookies } from 'next/headers';
import { ResolveHubContextUseCase } from '@terabound/application/src/use-cases/hub/resolve-hub-context-use-case';
import { 
  FirestoreUsersRepository,
  FirestoreMembershipsRepository,
  FirestoreRolesRepository,
  FirestoreTenantsRepository
} from '@terabound/repositories';

const COOKIE_NAME = 'tb_selected_tenant_id';

export async function resolveHubContextAction(userId: string, tenantId?: string) {
  try {
    const cookieStore = await cookies();
    const activeTenantId = tenantId || cookieStore.get(COOKIE_NAME)?.value;

    const useCase = new ResolveHubContextUseCase(
      new FirestoreUsersRepository(),
      new FirestoreMembershipsRepository(),
      new FirestoreRolesRepository(),
      new FirestoreTenantsRepository()
    );

    const context = await useCase.execute({ userId, tenantId: activeTenantId });
    return { success: true, context };
  } catch (error: any) {
    console.error('[resolveHubContextAction] Error:', error);
    return { success: false, error: error.message };
  }
}

export async function selectTenantAction(tenantId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, tenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 1 semana
  });
  return { success: true };
}

export async function clearTenantAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}
