import type { AuditEvent, ActorContext, AuditSeverity } from '@terabound/domain';

export class AuditEventFactory {
  
  /**
   * Construye un evento base a partir del contexto del actor
   */
  private static createBase(
    eventType: string,
    entityType: string,
    entityId: string,
    action: string,
    actor: ActorContext,
    severity: AuditSeverity = 'info'
  ): Omit<AuditEvent, 'createdAt'> {
    return {
      eventType,
      entityType,
      entityId,
      action,
      actorUserId: actor.actorUserId,
      actorType: actor.actorType,
      source: actor.source,
      correlationId: actor.correlationId,
      tenantId: actor.tenantId,
      severity,
      status: 'success',
    };
  }

  // --- IAM EVENTS ---

  static userCreated(entityId: string, actor: ActorContext, metadata?: Record<string, unknown>): Omit<AuditEvent, 'createdAt'> {
    return {
      ...this.createBase('UserCreated', 'User', entityId, 'CREATE', actor, 'info'),
      metadata
    };
  }

  static userBlocked(entityId: string, actor: ActorContext): Omit<AuditEvent, 'createdAt'> {
    return this.createBase('UserBlocked', 'User', entityId, 'UPDATE', actor, 'warning');
  }

  static roleCreated(entityId: string, actor: ActorContext, tenantId?: string): Omit<AuditEvent, 'createdAt'> {
    return {
      ...this.createBase('RoleCreated', 'Role', entityId, 'CREATE', actor, 'info'),
      tenantId: tenantId || actor.tenantId
    };
  }

  static roleUpdated(entityId: string, actor: ActorContext, tenantId?: string): Omit<AuditEvent, 'createdAt'> {
    return {
      ...this.createBase('RoleUpdated', 'Role', entityId, 'UPDATE', actor, 'info'),
      tenantId: tenantId || actor.tenantId
    };
  }

  static membershipGranted(entityId: string, actor: ActorContext, tenantId: string): Omit<AuditEvent, 'createdAt'> {
    return {
      ...this.createBase('MembershipGranted', 'Membership', entityId, 'CREATE', actor, 'info'),
      tenantId
    };
  }

  static membershipRevoked(entityId: string, actor: ActorContext, tenantId: string): Omit<AuditEvent, 'createdAt'> {
    return {
      ...this.createBase('MembershipRevoked', 'Membership', entityId, 'DELETE', actor, 'warning'),
      tenantId
    };
  }

  // --- FAILURE EVENTS ---

  static operationFailed(
    eventType: string, 
    entityType: string, 
    entityId: string, 
    action: string, 
    actor: ActorContext, 
    errorCode: string
  ): Omit<AuditEvent, 'createdAt'> {
    return {
      ...this.createBase(eventType, entityType, entityId, action, actor, 'critical'),
      status: 'failure',
      errorCode
    };
  }
}
