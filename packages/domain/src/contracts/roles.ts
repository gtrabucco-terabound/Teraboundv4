// ============================================================
// Contratos Roles — §14.2 de la spec ejecutable
// ============================================================

export type PermissionScope = 'own' | 'team' | 'department' | 'tenant' | 'platform';

/** tenants/{tenantId}/_tn_roles/{roleId} */
export interface RoleDefinition {
  id?: string;
  key: string;
  name: string;
  description?: string;
  scope: 'platform' | 'tenant'; // GAP 3: Separación estricta
  isSystem: boolean;

  inherits?: string[];
  permissions: string[];
  scopes: Record<string, PermissionScope>;
  active: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}
