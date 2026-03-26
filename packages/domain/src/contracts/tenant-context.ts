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

/** Evento de auditoría — todo cambio relevante genera uno */
export interface AuditEvent {
  eventType: string;
  entityType: string;
  entityId: string;
  actorUserId: string;
  actorType: 'user' | 'system' | 'support';
  action: string;
  tenantId?: string;
  moduleId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  severity: 'info' | 'warning' | 'critical';
  createdAt: Date;
}
