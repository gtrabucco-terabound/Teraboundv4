// ============================================================
// Contratos Governance — §14.4 de la spec ejecutable
// ============================================================

import type { Cardinality, RelationshipStrategy, CascadePolicy } from './enums';

/** _gl_entities/{entityId} */
export interface EntityDefinition {
  id?: string;
  key: string;
  name: string;
  moduleId?: string;
  scope: 'global' | 'tenant';
  storagePath: string;
  primaryIdField: string;
  displayField?: string;
  auditable: boolean;
  softDelete: boolean;
  active: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

/** _gl_relationships/{relationId} */
export interface RelationshipDefinition {
  id?: string;
  key: string;
  name: string;
  sourceEntityKey: string;
  targetEntityKey: string;
  cardinality: Cardinality;
  required: boolean;
  crossModule: boolean;
  strategy: RelationshipStrategy;
  cascadePolicy: CascadePolicy;
  active: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

/** _gl_validation_rules/{ruleId} */
export interface ValidationRule {
  id?: string;
  entityKey: string;
  name: string;
  type: 'required' | 'enum' | 'format' | 'custom';
  field: string;
  config: Record<string, unknown>;
  active: boolean;
  updatedAt: Date;
  updatedBy: string;
}

/** _gl_reference_models/{modelId} */
export interface ReferenceModel {
  id?: string;
  key: string;
  name: string;
  entityKeys: string[];
  strategy: 'shared-master' | 'lookup' | 'projection';
  active: boolean;
  updatedAt: Date;
  updatedBy: string;
}
