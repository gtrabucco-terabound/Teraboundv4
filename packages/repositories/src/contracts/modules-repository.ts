// ============================================================
// Contrato: ModulesRepository
// ============================================================

import type { ModuleDefinition } from '@terabound/domain';

export interface ModulesRepository {
  getById(moduleId: string): Promise<ModuleDefinition | null>;
  list(filters?: { status?: string; category?: string; visibility?: string }): Promise<ModuleDefinition[]>;
  create(input: Omit<ModuleDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  update(moduleId: string, input: Partial<ModuleDefinition>): Promise<void>;
  updateStatus(moduleId: string, status: string): Promise<void>;
}
