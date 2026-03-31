// ============================================================
// Contratos Events — §5.1 (_gl_event_catalog)
// ============================================================

/** _gl_event_catalog/{eventType} */
export interface EventCatalogEntry {
  eventType: string;
  domain: string;
  version: number;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  retentionDays: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
