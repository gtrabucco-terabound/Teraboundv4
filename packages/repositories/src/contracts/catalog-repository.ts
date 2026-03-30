import type { Catalog, CatalogItem } from '@terabound/domain';

export interface CatalogsRepository {
  list(): Promise<Catalog[]>;
  getById(id: string): Promise<Catalog | null>;
  create(data: Omit<Catalog, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string>;
  update(id: string, data: Partial<Catalog>): Promise<void>;
  toggleActive(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface CatalogItemsRepository {
  listByCatalog(catalogId: string): Promise<CatalogItem[]>;
  getById(id: string): Promise<CatalogItem | null>;
  create(item: Omit<CatalogItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string>;
  update(id: string, item: Partial<CatalogItem>): Promise<void>;
  toggleActive(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}
