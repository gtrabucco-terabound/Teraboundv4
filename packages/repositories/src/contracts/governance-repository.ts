import type { EntityDefinition, RelationshipDefinition, ValidationRule } from '@terabound/domain';

export interface EntitiesRepository {
  list(): Promise<EntityDefinition[]>;
  getByKey(key: string): Promise<EntityDefinition | null>;
  create(entity: Omit<EntityDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  update(id: string, entity: Partial<EntityDefinition>): Promise<void>;
  delete(id: string): Promise<void>;
  toggleActive(id: string): Promise<void>;
}

export interface RelationshipsRepository {
  list(): Promise<RelationshipDefinition[]>;
  listBySource(entityKey: string): Promise<RelationshipDefinition[]>;
  create(relation: Omit<RelationshipDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  update(id: string, relation: Partial<RelationshipDefinition>): Promise<void>;
  delete(id: string): Promise<void>;
  toggleActive(id: string): Promise<void>;
}

export interface ValidationRulesRepository {
  listByEntity(entityKey: string): Promise<ValidationRule[]>;
  create(rule: Omit<ValidationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  update(id: string, rule: Partial<ValidationRule>): Promise<void>;
  delete(id: string): Promise<void>;
  toggleActive(id: string): Promise<void>;
}
