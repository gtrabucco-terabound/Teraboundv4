// ============================================================
// Contratos Automation — §5.1 (_gl_automation_rules)
// ============================================================

/** _gl_automation_rules/{ruleId} */
export interface AutomationRule {
  id?: string;
  key: string;
  name: string;
  description?: string;
  triggerEvent: string;
  conditions: Record<string, unknown>[];
  actions: Record<string, unknown>[];
  active: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}
