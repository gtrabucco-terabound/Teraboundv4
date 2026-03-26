// ============================================================
// Contratos Operations — §5.1 (jobs, errors, incidents)
// ============================================================

import type { JobStatus, ErrorSeverity, IncidentSeverity, IncidentStatus } from './enums';

/** _gl_jobs/{jobId} */
export interface Job {
  id?: string;
  type: string;
  scope: 'platform' | 'tenant' | 'module';
  tenantId?: string;
  moduleId?: string;
  status: JobStatus;
  payload?: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  createdBy: string;
}

/** _gl_errors/{errorId} */
export interface ErrorRecord {
  id?: string;
  source: 'frontend' | 'function' | 'integration';
  moduleId?: string;
  tenantId?: string;
  code: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  status: 'open' | 'ack' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
}

/** _gl_incidents/{incidentId} */
export interface Incident {
  id?: string;
  title: string;
  description?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  moduleIds?: string[];
  tenantIds?: string[];
  createdAt: Date;
  createdBy: string;
  resolvedAt?: Date;
}
