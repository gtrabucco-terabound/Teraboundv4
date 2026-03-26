// ============================================================
// Contratos Analytics — §5.1 (_gl_metrics)
// ============================================================

/** _gl_metrics/{metricId} */
export interface Metric {
  id?: string;
  key: string;
  scope: 'platform' | 'tenant' | 'module';
  tenantId?: string;
  moduleId?: string;
  value: number;
  unit?: string;
  measuredAt: Date;
}
