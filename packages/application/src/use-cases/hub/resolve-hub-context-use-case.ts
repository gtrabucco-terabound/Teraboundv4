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
      },
      permissions: [],
      modules: [],
      navigation: [],
    };

    // 2. Si se especifica un Tenant, cargar contexto específico
    if (tenantId) {
      const tenant = await this.tenantsRepo.getById(tenantId);
      if (!tenant) throw new Error('Empresa no encontrada.');

      // Buscar Membresía
      const userMemberships = await this.membershipsRepo.listByUser(userId);
      const membership = userMemberships.find(m => m.tenantId === tenantId);
      
      if (!membership || membership.status !== 'active') {
        throw new Error('No tienes acceso activo a esta empresa.');
      }

      // Resolver Roles y Permisos (Global + Tenant)
      // Buscamos el rol asignado en la membresía
      const role = await this.rolesRepo.getById(membership.roleId, tenantId);
      
      context.tenant = {
        id: tenantId,
        roleId: membership.roleId,
        legalName: tenant.legalName,
      };

      context.permissions = role?.permissions || [];
      
      // En una fase posterior, aquí cargaríamos los módulos habilitados del tenant
      context.modules = []; 
    }

    return context;
  }
}
