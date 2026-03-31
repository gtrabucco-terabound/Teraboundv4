import { FirestoreAuditRepository } from '../firestore/firestore-audit-repository';
import type { EventCatalogEntry } from '@terabound/domain';

const eventCatalog: Omit<EventCatalogEntry, 'createdAt' | 'updatedAt'>[] = [
  // IAM
  { eventType: 'UserInvited', domain: 'IAM', version: 1, description: 'Usuario invitado al sistema', severity: 'info', retentionDays: 365, active: true },
  { eventType: 'UserActivated', domain: 'IAM', version: 1, description: 'Usuario activó su cuenta', severity: 'info', retentionDays: 365, active: true },
  { eventType: 'UserBlocked', domain: 'IAM', version: 1, description: 'Usuario bloqueado por administrador o sistema', severity: 'warning', retentionDays: 730, active: true },
  { eventType: 'MembershipGranted', domain: 'IAM', version: 1, description: 'Acceso concedido a un tenant', severity: 'info', retentionDays: 365, active: true },
  { eventType: 'MembershipRevoked', domain: 'IAM', version: 1, description: 'Acceso revocado de un tenant', severity: 'warning', retentionDays: 730, active: true },
  { eventType: 'RoleCreated', domain: 'IAM', version: 1, description: 'Nuevo rol definido', severity: 'info', retentionDays: 365, active: true },
  
  // Platform
  { eventType: 'ModuleRegistered', domain: 'Platform', version: 1, description: 'Nuevo módulo registrado en la plataforma', severity: 'info', retentionDays: 365, active: true },
  { eventType: 'FeatureFlagChanged', domain: 'Platform', version: 1, description: 'Cambio en estado de feature flag', severity: 'warning', retentionDays: 365, active: true },
  
  // Tenant
  { eventType: 'TenantCreated', domain: 'Tenant', version: 1, description: 'Nuevo tenant (empresa) creado', severity: 'critical', retentionDays: 1825, active: true },
  { eventType: 'TenantSuspended', domain: 'Tenant', version: 1, description: 'Tenant suspendido por falta de pago o violación de términos', severity: 'critical', retentionDays: 1825, active: true },
  
  // Governance
  { eventType: 'EntityDefinitionChanged', domain: 'Governance', version: 1, description: 'Cambio estructural en definición de entidad', severity: 'critical', retentionDays: 1825, active: true },
  { eventType: 'ValidationRuleChanged', domain: 'Governance', version: 1, description: 'Regla de validación de datos modificada', severity: 'warning', retentionDays: 730, active: true },
  
  // Operations
  { eventType: 'JobFailed', domain: 'Operations', version: 1, description: 'Fallo en ejecución de job programado', severity: 'warning', retentionDays: 30, active: true },
  { eventType: 'IncidentOpened', domain: 'Operations', version: 1, description: 'Nuevo incidente de soporte reportado', severity: 'warning', retentionDays: 90, active: true },
];

export async function seedAuditCatalog() {
  const repo = new FirestoreAuditRepository();
  console.log('🌱 Seeding Audit Event Catalog...');

  for (const event of eventCatalog) {
    try {
      const existing = await repo.getEventDefinition(event.eventType);
      if (!existing) {
        // En FirestoreAuditRepository no definimos un método 'createEventDefinition' directo 
        // pero podemos usar updateEventDefinition si el doc no existe y se comporta como set? 
        // No, Firestore update falla si no existe. Usaremos setDoc via repo si lo añadimos o directo aquí.
        // Vamos a usar una implementación simple aquí.
        const { getFirebaseFirestore } = await import('@terabound/firebase-client');
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const db = getFirebaseFirestore();
        await setDoc(doc(db, '_gl_event_catalog', event.eventType), {
          ...event,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`✅ Event [${event.eventType}] created.`);
      } else {
        console.log(`ℹ️ Event [${event.eventType}] already exists. Skipping.`);
      }
    } catch (error) {
      console.error(`❌ Error seeding [${event.eventType}]:`, error);
    }
  }
}
