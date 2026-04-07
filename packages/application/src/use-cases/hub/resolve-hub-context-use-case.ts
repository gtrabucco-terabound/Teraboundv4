import type { 
  UsersRepository, 
  MembershipsRepository, 
  RolesRepository, 
  TenantsRepository 
} from '../../../contracts/security-repositories';
import type { HubContext, UserRecord } from '@terabound/domain';

export interface ResolveHubContextRequest {
  userId: string;
  tenantId?: string;
}

export class ResolveHubContextUseCase {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly membershipsRepo: MembershipsRepository,
    private readonly rolesRepo: RolesRepository,
    private readonly tenantsRepo: TenantsRepository
  ) {}

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
      userMemberships.map(async (m) => {
        const t = await this.tenantsRepo.getById(m.tenantId);
        const r = await this.rolesRepo.getById(m.roleId, m.tenantId);
        return {
          id: m.tenantId,
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

      const membership = userMemberships.find(m => m.tenantId === tenantId);
      
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
      
      // Módulos: En fase posterior cargaríamos los módulos habilitados del tenant
      context.modules = []; 
    }

    return context;
  }
}
