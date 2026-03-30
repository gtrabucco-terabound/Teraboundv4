import { 
  getFirebaseFirestore, 
} from '@terabound/firebase-client';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { Collections } from '@terabound/config';

const BASE_CATALOGS = [
  { id: 'countries', name: 'Países', description: 'Listado global de países autorizados', scope: 'global', isOverridable: false },
  { id: 'currencies', name: 'Monedas', description: 'Monedas soportadas por la plataforma', scope: 'global', isOverridable: false },
  { id: 'locales', name: 'Idiomas/Locales', description: 'Configuraciones regionales', scope: 'global', isOverridable: false },
  { id: 'tenant-status', name: 'Estados de Tenant', description: 'Ciclo de vida de un suscriptor', scope: 'global', isOverridable: false },
  { id: 'user-status', name: 'Estados de Usuario', description: 'Estados de acceso a plataforma', scope: 'global', isOverridable: false },
  { id: 'module-categories', name: 'Categorías de Módulos', description: 'Clasificación de micro-apps', scope: 'global', isOverridable: false },
  { id: 'yes-no', name: 'Si/No', description: 'Opciones binarias estándar', scope: 'global', isOverridable: false },
  { id: 'active-inactive', name: 'Activo/Inactivo', description: 'Opciones de disponibilidad', scope: 'global', isOverridable: false },
  { id: 'priority-levels', name: 'Niveles de Prioridad', description: 'Escala de criticidad operativa', scope: 'global', isOverridable: false },
  { id: 'severity-levels', name: 'Niveles de Severidad', description: 'Escala de criticidad técnica/incidencias', scope: 'global', isOverridable: false },
];

const BASE_ITEMS: Record<string, any[]> = {
  'countries': [
    { key: 'AR', label: 'Argentina', value: 'AR', sortOrder: 1, metadata: { region: 'LATAM', currency: 'ARS' } },
    { key: 'CL', label: 'Chile', value: 'CL', sortOrder: 2, metadata: { region: 'LATAM', currency: 'CLP' } },
    { key: 'US', label: 'Estados Unidos', value: 'US', sortOrder: 3, metadata: { region: 'NAM', currency: 'USD' } },
  ],
  'currencies': [
    { key: 'USD', label: 'Dólares (USD)', value: 'USD', sortOrder: 1, metadata: { symbol: '$' } },
    { key: 'ARS', label: 'Pesos Argentinos (ARS)', value: 'ARS', sortOrder: 2, metadata: { symbol: '$' } },
    { key: 'CLP', label: 'Pesos Chilenos (CLP)', value: 'CLP', sortOrder: 3, metadata: { symbol: '$' } },
  ],
  'tenant-status': [
    { key: 'active', label: 'Activo', value: 'active', sortOrder: 1 },
    { key: 'suspended', label: 'Suspendido', value: 'suspended', sortOrder: 2 },
    { key: 'draft', label: 'Borrador', value: 'draft', sortOrder: 3 },
  ],
  'priority-levels': [
    { key: 'low', label: 'Baja', value: 'low', sortOrder: 1 },
    { key: 'medium', label: 'Media', value: 'medium', sortOrder: 2 },
    { key: 'high', label: 'Alta', value: 'high', sortOrder: 3 },
    { key: 'critical', label: 'Crítica', value: 'critical', sortOrder: 4 },
  ],
  'severity-levels': [
    { key: 'info', label: 'Informativo', value: 'info', sortOrder: 1 },
    { key: 'warning', label: 'Advertencia', value: 'warning', sortOrder: 2 },
    { key: 'error', label: 'Error', value: 'error', sortOrder: 3 },
    { key: 'critical', label: 'Crítico', value: 'critical', sortOrder: 4 },
  ]
};

export async function seedMasterData(): Promise<void> {
  const db = getFirebaseFirestore();
  const catalogCol = collection(db, Collections.CATALOGS);
  const itemsCol = collection(db, Collections.CATALOG_ITEMS);

  console.log('[Seed] Iniciando Master Data Seed...');

  for (const catalog of BASE_CATALOGS) {
    const catalogRef = doc(db, Collections.CATALOGS, catalog.id);
    const snap = await getDocs(query(catalogCol, where('key', '==', catalog.id)));

    if (snap.empty) {
      console.log(`[Seed] Creando catálogo: ${catalog.id}`);
      await setDoc(catalogRef, {
        ...catalog,
        key: catalog.id,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'system',
        updatedBy: 'system'
      });

      // Insertar items si existen por defecto
      const items = BASE_ITEMS[catalog.id] || [];
      for (const item of items) {
        await addDoc(itemsCol, {
          ...item,
          catalogId: catalog.id,
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: 'system',
          updatedBy: 'system'
        });
      }
    } else {
      console.log(`[Seed] El catálogo ${catalog.id} ya existe. Saltando.`);
    }
  }

  console.log('[Seed] Master Data Seed completado.');
}
