// ============================================================
// Contratos Navigation — §14.3 de la spec ejecutable
// ============================================================

/** _gl_navigation/{navId} */
export interface NavigationSchema {
  id?: string;
  key: string;
  name: string;
  type: 'sidebar' | 'topbar' | 'hub-launcher' | 'admin';
  active: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

/** _gl_navigation_items/{itemId} */
export interface NavigationItem {
  id?: string;
  navId: string;
  parentId?: string;
  label: string;
  icon?: string;
  route: string;
  moduleId?: string;
  requiredPermissions: string[];
  requiredModules?: string[];
  visibility: 'always' | 'module-enabled' | 'role-based';
  badgeType?: 'none' | 'info' | 'warning' | 'error';
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}
