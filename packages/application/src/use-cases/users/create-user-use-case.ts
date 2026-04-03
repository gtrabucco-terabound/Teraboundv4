import type { UsersRepository, AuditService } from '@terabound/repositories';
import { AuditEventFactory } from '@terabound/repositories';
import type { UserRecord, ActorContext } from '@terabound/domain';

export interface CreateUserCommand {
  user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;
  actor: ActorContext;
}

export class CreateUserUseCase {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    try {
      // 1. Persistencia
      const userId = await this.usersRepo.create(command.user);

      // 2. Auditoría orquestada
      const auditEvent = AuditEventFactory.userCreated(userId, command.actor, { 
        email: command.user.email,
        globalType: command.user.globalType 
      });
      
      await this.auditService.logGlobal(auditEvent);

      return userId;
    } catch (error) {
      // Log failure if necessary
      console.error('[CreateUserUseCase] Error:', error);
      throw error;
    }
  }
}
