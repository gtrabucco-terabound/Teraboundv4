import type {
  UsersRepository,
  MembershipsRepository,
  RolesRepository,
  TenantsRepository,
  TenantsModulesRepository,
  ModulesRepository
} from '@terabound/repositories';
import type { HubContext, UserRecord, Membership } from '@terabound/domain';

export interface ResolveHubContextRequest {
  userId: string;
  tenantId?: string;
}

export class ResolveHubContextUseCase {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly membershipsRepo: MembershipsRepository,
    private readonly rolesRepo: RolesRepository,
    private readonly tenantsRepo: TenantsRepository,
    private readonly tenantModulesRepo: TenantsModulesRepository,
    private readonly modulesRepo: ModulesRepository
  ) { }

  async execute(request: ResolveHubContextRequest): Promise<HubContext> {
    const { userId, tenantId } = request;

    // 1. Cargar Usuario
    const user = await this.usersRepo.getById(userId);
    if (!user || user.status !== 'active') {
      throw new Error('Usuario no encontrado o inactivo.');
    }

    const context: HubContext = {
      user: {
        id: user.userId,
        email: user.email,
        globalType: user.globalType,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      tenant: undefined,
      availableTenants: [],
      permissions: [],
      modules: [],
      navigation: [],
    };

    // 2. Cargar todas las membresías del usuario para el selector
    const userMemberships = await this.membershipsRepo.listByUser(userId);

    // Resolver nombres de empresas y roles para el selector
    context.availableTenants = await Promise.all(
      userMemberships.map(async (m: Membership) => {
        const t = await this.tenantsRepo.getById(m.tenantId!);
        const r = await this.rolesRepo.getById(m.roleId, m.tenantId);
        return {
          id: m.tenantId!,
          legalName: t?.legalName || 'Empresa Desconocida',
          roleId: m.roleId,
          roleName: r?.name || 'Rol Desconocido',
        };
      })
    );

    // 3. Si se especifica un Tenant, cargar contexto específico
    if (tenantId) {
      const tenant = await this.tenantsRepo.getById(tenantId);
      if (!tenant) throw new Error('Empresa no encontrada.');

      const membership = userMemberships.find((m: Membership) => m.tenantId === tenantId);

      if (!membership || membership.status !== 'active') {
        throw new Error('No tienes acceso activo a esta empresa.');
      }

      // Resolver Roles y Permisos (Global + Tenant)
      const role = await this.rolesRepo.getById(membership.roleId, tenantId);

      context.tenant = {
        id: tenantId,
        roleId: membership.roleId,
        legalName: tenant.legalName,
      };

      context.permissions = role?.permissions || [];

      // 4. Cargar Módulos habilitados del tenant con su metadata
      const enabledModules = await this.tenantModulesRepo.list(tenantId);
      const activeModules = enabledModules.filter(m => m.status === 'enabled');

      context.modules = await Promise.all(
        activeModules.map(async (tm) => {
          const metadata = await this.modulesRepo.getById(tm.moduleId);
          return {
            moduleId: tm.moduleId,
            enabled: true,
            // Agregamos metadata extra para la UI del App Launcher (aunque no esté en la interfaz base, JS lo permite)
            name: metadata?.name || tm.moduleId,
            slug: metadata?.slug || tm.moduleId,
            icon: metadata?.icon,
            category: metadata?.category
          } as any;
        })
      );
    }

    return context;
  }
}
