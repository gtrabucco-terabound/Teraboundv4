// ============================================================
// diagnostico-sistema.mjs
// Script de validación de entorno para Terabound Backend
// ============================================================

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const [,, serviceAccountPath] = process.argv;

if (!serviceAccountPath) {
  console.error('\n❌ Falta la ruta al Service Account JSON.\nUso: node scripts/diagnostico-sistema.mjs <ruta/serviceAccount.json>\n');
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(readFileSync(resolve(process.cwd(), serviceAccountPath), 'utf-8'));
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  console.log('\n🔍 Iniciando diagnóstico de Terabound...\n');

  async function runDiagnostics() {
    // 1. Check _gl_platform_config
    const configSnap = await db.collection('_gl_platform_config').doc('firebase_shared').get();
    if (configSnap.exists) {
      console.log('✅ [_gl_platform_config/firebase_shared]: EXISTE');
    } else {
      console.log('❌ [_gl_platform_config/firebase_shared]: NO ENCONTRADO (Ejecutar seed)');
    }

    // 2. Check for at least one Platform Admin
    const adminsSnap = await db.collection('users').where('globalType', '==', 'platform_admin').limit(1).get();
    if (!adminsSnap.empty) {
      console.log(`✅ [users]: Encontrado platform_admin (${adminsSnap.docs[0].data().email})`);
    } else {
      console.log('❌ [users]: No se encontró ningún platform_admin (Acceso bloqueado)');
    }

    // 3. Check Core Modules
    const modulesSnap = await db.collection('_gl_modules').get();
    console.log(`ℹ️  [_gl_modules]: ${modulesSnap.size} módulos registrados`);

    // 4. Check Navigation Items
    const navSnap = await db.collection('_gl_navigation_items').get();
    console.log(`ℹ️  [_gl_navigation_items]: ${navSnap.size} items de menú`);

    // 5. Check Incidents (New)
    const incidentsSnap = await db.collection('_gl_incidents').limit(5).get();
    console.log(`ℹ️  [_gl_incidents]: ${incidentsSnap.size} incidencias recientes detectadas`);

    // 6. Check Tenant Modules (New)
    const tenantModulesSnap = await db.collection('_tn_modules').get();
    console.log(`ℹ️  [_tn_modules]: ${tenantModulesSnap.size} asignaciones de módulos a tenants`);

    console.log('\n🏁 Diagnóstico finalizado.\n');
  }

  runDiagnostics();
} catch (err) {
  console.error('\n💥 Error fatal durante el diagnóstico:', err.message);
}
