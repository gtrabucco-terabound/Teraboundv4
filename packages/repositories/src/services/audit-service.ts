import { AuditRepository } from '../contracts/audit-repository';
import type { AuditEvent, TenantEventLog } from '@terabound/domain';

export class AuditService {
  constructor(private readonly auditRepo: AuditRepository) {}

  /**
   * Registra un evento global de auditoría (catálogo maestro)
   */
  async logGlobal(event: Omit<AuditEvent, 'createdAt'>): Promise<void> {
    try {
      // Redacción básica (puedes expandir esto según políticas)
      const sanitizedEvent = this.sanitize(event);
      await this.auditRepo.logGlobal(sanitizedEvent);
    } catch (error) {
      console.error('[AuditService] Failed to log global audit event:', error);
    }
  }

  /**
   * Registra un evento operativo en un tenant específico
   */
  async logTenant(tenantId: string, event: Omit<TenantEventLog, 'id' | 'createdAt'>): Promise<void> {
     try {
       await this.auditRepo.logTenant(tenantId, event);
     } catch (error) {
       console.error(`[AuditService] Failed to log tenant audit event (${tenantId}):`, error);
     }
  }

  /**
   * Sanitiza el payload del evento para evitar persistencia de datos sensibles
   */
  private sanitize<T extends Record<string, any>>(data: T): T {
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'idToken', 'refreshToken'];
    const sanitized = { ...data };

    const cleanObject = (obj: any) => {
      if (typeof obj !== 'object' || obj === null) return;
      for (const key in obj) {
        if (sensitiveFields.includes(key)) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          cleanObject(obj[key]);
        }
      }
    };

    cleanObject(sanitized);
    return sanitized;
  }
}
