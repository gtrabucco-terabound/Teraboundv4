// ============================================================
// seed-firestore.mjs
// Seed inicial de Firestore para Terabound Backend
// Crea:
//   1. /users/{uid}         → usuario platform_admin
//   2. /_gl_platform_config/firebase_shared  → config Firebase
//
// USO:
//   1. Descargá el Service Account JSON desde Firebase Console:
//      → Project Settings → Service Accounts → Generate new private key
//   2. Ejecutá:
//      node scripts/seed-firestore.mjs <ruta/serviceAccount.json> <uid> <email>
//   Ejemplo:
//      node scripts/seed-firestore.mjs ./serviceAccount.json abc123 admin@teraboundeco.com
// ============================================================

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Argumentos de línea de comandos ──────────────────────────
const [,, serviceAccountPath, uid, email] = process.argv;

if (!serviceAccountPath || !uid || !email) {
  console.error(`
❌  Faltan argumentos.

Uso:
  node scripts/seed-firestore.mjs <ruta/serviceAccount.json> <uid> <email>

Ejemplo:
  node scripts/seed-firestore.mjs ./serviceAccount.json abc123uid admin@teraboundeco.com
`);
  process.exit(1);
}

// ── Inicialización Firebase Admin ─────────────────────────────
const serviceAccount = JSON.parse(
  readFileSync(resolve(process.cwd(), serviceAccountPath), 'utf-8')
);

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();
const now = Timestamp.now();
const displayName = email.split('@')[0];

// ── Documento 1: Usuario Platform Admin ──────────────────────
const userDoc = {
  userId: uid,
  email,
  displayName,
  photoURL: null,
  phoneNumber: null,
  status: 'active',
  globalType: 'platform_admin',
  lastLoginAt: null,
  lastSeenAt: null,
  createdAt: now,
  createdBy: 'seed-script',
  updatedAt: now,
  updatedBy: 'seed-script',
  deletedAt: null,
};

// ── Documento 2: Firebase Shared Config ──────────────────────
// Los valores se leen de las variables de entorno del proyecto
// o podés editarlos directamente aquí.
const platformConfigDoc = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appCheckSiteKey: '',
  defaultRegion: 'us-east1',
  updatedAt: now,
  updatedBy: 'seed-script',
  version: 1,
};

// ── Ejecución ─────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱 Iniciando seed de Firestore...\n');

  // 1. Usuario
  await db.collection('users').doc(uid).set(userDoc);
  console.log(`✅  /users/${uid} creado con globalType: "platform_admin"`);
  console.log(`     email: ${email}`);

  // 2. Platform Config
  await db.collection('_gl_platform_config').doc('firebase_shared').set(platformConfigDoc);
  console.log(`✅  /_gl_platform_config/firebase_shared creado`);
  console.log(`     projectId: ${platformConfigDoc.projectId || '(vacío — editar en UI)'}`);

  console.log('\n🎉 Seed completado exitosamente.\n');
  console.log('📝 Próximos pasos:');
  console.log('   1. Iniciá el Backend: npm run dev --workspace=apps/backend');
  console.log('   2. Logueate con el email usado en el seed');
  console.log('   3. Cargá la config de Firebase en Configuración de Plataforma\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌ Error durante el seed:', err.message);
  process.exit(1);
});
