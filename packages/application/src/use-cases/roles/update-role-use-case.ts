import type { RolesRepository } from '@terabound/repositories';
import { AuditEventFactory, type AuditService } from '@terabound/audit';
import type { RoleDefinition, ActorContext } from '@terabound/domain';

export interface UpdateRoleCommand {
  roleId: string;
  data: Partial<Omit<RoleDefinition, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>>;
  tenantId?: string;
  actor: ActorContext;
}

export class UpdateRoleUseCase {
  constructor(
    private readonly rolesRepo: RolesRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(command: UpdateRoleCommand): Promise<void> {
    try {
      // 1. Verificar existencia y permisos (simplificado por ahora)
      const existingRole = await this.rolesRepo.getById(command.roleId, command.tenantId);
      if (!existingRole) {
        throw new Error('Role not found');
      }

      // 2. Persistencia (inyectando autor de modificación)
      const updatePayload = {
        ...command.data,
        updatedBy: command.actor.actorUserId
      };
      await this.rolesRepo.update(command.roleId, updatePayload, command.tenantId);

      // 3. Auditoría orquestada
      const auditEvent = AuditEventFactory.roleUpdated(command.roleId, command.actor, command.tenantId);
      
      if (!command.tenantId) {
        await this.auditService.logGlobal(auditEvent);
      } else {
        await this.auditService.logGlobal(auditEvent);
        await this.auditService.logTenant(command.tenantId, {
          eventType: 'RoleUpdated',
          moduleId: 'IAM',
          entityType: 'Role',
          entityId: command.roleId,
          actorUserId: command.actor.actorUserId,
          payload: { updatedFields: Object.keys(command.data) }
        });
      }
    } catch (error: any) {
      console.error('[UpdateRoleUseCase] Error:', error);
      
      // Registrar falla
      const failureEvent = AuditEventFactory.operationFailed(
        'RoleUpdated',
        'Role',
        command.roleId,
        'UPDATE',
        command.actor,
        error.message || 'UNKNOWN_ERROR'
      );
      await this.auditService.logFailure(failureEvent);
      
      throw error;
    }
  }
}
