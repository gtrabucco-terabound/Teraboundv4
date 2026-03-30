// ============================================================
// Contratos Master Data — §5.1 (_gl_catalogs + _gl_catalog_items)
// ============================================================

/** _gl_catalogs/{catalogId} */
export interface Catalog {
  id?: string;
  key: string;
  name: string;
  description?: string;
  scope: 'global' | 'tenant';
  isOverridable: boolean;
  active: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

/** _gl_catalog_items/{itemId} */
export interface CatalogItem {
  id?: string;
  catalogId: string;
  key: string;
  label: string;
  value: string;
  metadata?: Record<string, unknown>;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}
