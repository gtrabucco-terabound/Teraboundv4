import type { NavigationSchema, NavigationItem } from '@terabound/domain';

export interface NavigationRepository {
  list(): Promise<NavigationSchema[]>;
  getById(id: string): Promise<NavigationSchema | null>;
  getByKey(key: string): Promise<NavigationSchema | null>;
  create(schema: Omit<NavigationSchema, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string>;
  update(id: string, data: Partial<NavigationSchema>): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface NavigationItemsRepository {
  listByNav(navId: string): Promise<NavigationItem[]>;
  getById(id: string): Promise<NavigationItem | null>;
  create(item: Omit<NavigationItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string>;
  update(id: string, data: Partial<NavigationItem>): Promise<void>;
  delete(id: string): Promise<void>;
  reorder(id: string, sortOrder: number): Promise<void>;
}
