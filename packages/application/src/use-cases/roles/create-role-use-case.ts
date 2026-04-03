import type { RolesRepository } from '@terabound/repositories';
import { AuditEventFactory, type AuditService } from '@terabound/audit';
import type { RoleDefinition, ActorContext } from '@terabound/domain';

export interface CreateRoleCommand {
  role: Omit<RoleDefinition, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;
  tenantId?: string;
  actor: ActorContext;
}

export class CreateRoleUseCase {
  constructor(
    private readonly rolesRepo: RolesRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(command: CreateRoleCommand): Promise<string> {
    try {
      // 1. Persistencia (inyectando actor info)
      const rolePayload = {
        ...command.role,
        createdBy: command.actor.actorUserId,
        updatedBy: command.actor.actorUserId
      };
      const roleId = await this.rolesRepo.create(rolePayload, command.tenantId);

      // 2. Auditoría orquestada
      const auditEvent = AuditEventFactory.roleCreated(roleId, command.actor, command.tenantId);
      
      // If global role, log global audit. Otherwise, log tenant audit.
      if (!command.tenantId) {
        await this.auditService.logGlobal(auditEvent);
      } else {
        // En este diseño simplificado, usamos logGlobal para todo evento crítico del catálogo,
        // pero podemos decidir si enviarlo también al log del tenant.
        await this.auditService.logGlobal(auditEvent);
        
        // Log Tenant-specific event
        await this.auditService.logTenant(command.tenantId, {
          eventType: 'RoleCreated',
          moduleId: 'IAM',
          entityType: 'Role',
          entityId: roleId,
          actorUserId: command.actor.actorUserId,
          payload: { roleKey: command.role.key }
        });
      }

      return roleId;
    } catch (error: any) {
      console.error('[CreateRoleUseCase] Error:', error);
      
      const failureEvent = AuditEventFactory.operationFailed(
        'RoleCreated',
        'Role',
        'UNKNOWN', // Entidad aún no creada
        'CREATE',
        command.actor,
        error.message || 'UNKNOWN_ERROR'
      );
      await this.auditService.logFailure(failureEvent);
      
      throw error;
    }
  }
}
