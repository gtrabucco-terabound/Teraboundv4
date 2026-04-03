// ============================================================
// Contratos Core — §14.1 de la spec ejecutable
// ============================================================

import type { UserStatus, GlobalType } from './enums';

/** Contexto resuelto por request — obligatorio en toda operación */
export interface TenantContext {
  userId: string;
  tenantId?: string;
  activeRoleIds: string[];
  permissions: string[];
  enabledModules: string[];
  isPlatformAdmin: boolean;
}

/** Usuario autenticado — resolución desde Firebase Auth + Firestore */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  status: UserStatus;
  globalType: GlobalType;
  lastLoginAt?: Date;
  lastSeenAt?: Date;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  deletedAt?: Date;
}

/** Registro de usuario en base de datos global — collection: 'users' */
export interface UserRecord extends AuthenticatedUser {
  metadata?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
}


/** Origen del evento de auditoría */
export type AuditSource = 'ui' | 'function' | 'system' | 'support';

/** Estado del resultado de la operación */
export type AuditStatus = 'success' | 'failure';

/** Niveles de severidad normativa */
export type AuditSeverity = 'info' | 'warning' | 'critical';

/** Contexto del actor que ejecuta la acción */
export interface ActorContext {
  actorUserId: string;
  actorType: 'user' | 'system' | 'support';
  source: AuditSource;
  correlationId?: string;
  tenantId?: string; // Tenant desde el que opera el actor
}

/** Evento de auditoría — todo cambio relevante genera uno */
export interface AuditEvent {
  tenantId?: string;
  moduleId?: string;

  eventType: string;
  entityType: string;
  entityId: string;

  actorUserId: string;
  actorType: 'user' | 'system' | 'support';
  
  action: string;

  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;

  severity: AuditSeverity;
  source: AuditSource;
  status: AuditStatus;
  
  errorCode?: string;
  correlationId?: string;

  createdAt: Date;
}

/** Log de eventos por tenant — específico para actividad del negocio */
export interface TenantEventLog {
  id?: string;
  eventType: string;
  moduleId?: string;
  entityType: string;
  entityId: string;
  actorUserId: string;
  payload?: Record<string, unknown>;
  createdAt: Date;
}
