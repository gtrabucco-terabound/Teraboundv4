import {
  FirestoreEntitiesRepository,
  FirestoreRelationshipsRepository
} from '../index';
import { Cardinality, RelationshipStrategy, CascadePolicy } from '@terabound/domain';

export async function seedGovernance() {
  const entityRepo = new FirestoreEntitiesRepository();
  const relRepo = new FirestoreRelationshipsRepository();

  const entities = [
    {
      key: 'users',
      name: 'Usuarios Globales',
      description: 'Repositorio maestro de identidades de la plataforma.',
      storagePath: 'users',
      scope: 'global' as const,
      primaryIdField: 'id',
      displayField: 'email',
      auditable: true,
      softDelete: true,
      isSystem: true,
      isActive: true,
    },
    {
      key: 'tenants',
      name: 'Tenantes / Organizaciones',
      description: 'Entidades legales que agrupan usuarios y recursos.',
      storagePath: 'tenants',
      scope: 'global' as const,
      primaryIdField: 'id',
      displayField: 'legalName',
      auditable: true,
      softDelete: true,
      isSystem: true,
      isActive: true,
    },
    {
      key: 'members',
      name: 'Membresías de Tenante',
      description: 'Vínculo entre usuarios y tenantes con roles específicos.',
      storagePath: 'tenants/{tenantId}/members',
      scope: 'tenant' as const,
      primaryIdField: 'id',
      displayField: 'userId',
      auditable: true,
      softDelete: false,
      isSystem: true,
      isActive: true,
    },
    {
      key: 'roles',
      name: 'Roles de Sistema',
      description: 'Definiciones de seguridad y permisos por tenante.',
      storagePath: 'tenants/{tenantId}/_tn_roles',
      scope: 'tenant' as const,
      primaryIdField: 'id',
      displayField: 'name',
      auditable: true,
      softDelete: false,
      isSystem: true,
      isActive: true,
    },
    {
      key: 'catalogs',
      name: 'Catálogos Maestros',
      description: 'Definiciones de listas de valores normalizados.',
      storagePath: '_gl_catalogs',
      scope: 'global' as const,
      primaryIdField: 'id',
      displayField: 'name',
      auditable: true,
      softDelete: false,
      isSystem: true,
      isActive: true,
    },
    {
      key: 'catalog_items',
      name: 'Items de Catálogo',
      description: 'Valores individuales dentro de un catálogo.',
      storagePath: '_gl_catalog_items',
      scope: 'global' as const,
      primaryIdField: 'id',
      displayField: 'label',
      auditable: true,
      softDelete: false,
      isSystem: true,
      isActive: true,
    }
  ];

  console.log('Seeding Entities...');
  for (const ent of entities) {
    const existing = await entityRepo.getByKey(ent.key);
    if (!existing) {
      await entityRepo.create(ent as any);
      console.log(`- Created entity: ${ent.key}`);
    }
  }

  const relationships = [
    {
      key: 'tenant_members',
      name: 'Miembros de Tenante',
      sourceEntityKey: 'tenants',
      targetEntityKey: 'members',
      cardinality: Cardinality.ONE_TO_MANY,
      required: true,
      crossModule: false,
      strategy: RelationshipStrategy.REFERENCE,
      cascadePolicy: CascadePolicy.RESTRICT,
      isActive: true,
    },
    {
      key: 'user_memberships',
      name: 'Membresías de Usuario',
      sourceEntityKey: 'users',
      targetEntityKey: 'members',
      cardinality: Cardinality.ONE_TO_MANY,
      required: true,
      crossModule: false,
      strategy: RelationshipStrategy.REFERENCE,
      cascadePolicy: CascadePolicy.RESTRICT,
      isActive: true,
    },
    {
      key: 'catalog_items_relation',
      name: 'Items de Catálogo',
      sourceEntityKey: 'catalogs',
      targetEntityKey: 'catalog_items',
      cardinality: Cardinality.ONE_TO_MANY,
      required: true,
      crossModule: false,
      strategy: RelationshipStrategy.REFERENCE,
      cascadePolicy: CascadePolicy.CASCADE,
      isActive: true,
    }
  ];

  console.log('Seeding Relationships...');
  const currentRels = await relRepo.list();
  for (const rel of relationships) {
    const exists = currentRels.find(r => r.sourceEntityKey === rel.sourceEntityKey && r.targetEntityKey === rel.targetEntityKey);
    if (!exists) {
      await relRepo.create(rel as any);
      console.log(`- Created relationship: ${rel.sourceEntityKey} -> ${rel.targetEntityKey}`);
    }
  }

  console.log('Governance Seed complete.');
}
