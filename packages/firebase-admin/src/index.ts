// ============================================================
// @terabound/firebase-admin — Singleton Pattern (Server-Side Only)
// Requisito: §3.2 de la spec + SOPORTE ADMINISTRATIVO
// Garantiza una ÚNICA instancia de Firebase Admin por runtime.
// ============================================================

import * as admin from 'firebase-admin';

let adminApp: admin.app.App;

export function getFirebaseAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  // Si existe la variable de entorno, inicializamos con credenciales reales.
  // Si no, recurrimos a default (útil en dev local si estás autenticado con CLI).
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (serviceAccount) {
    const creds = JSON.parse(serviceAccount);
    return admin.initializeApp({
      credential: admin.credential.cert(creds),
      projectId: creds.project_id
    });
  }

  return admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });
}

/** Obtiene la instancia de Firestore Admin */
export function getFirestoreAdmin(): admin.firestore.Firestore {
  return getFirebaseAdminApp().firestore();
}

/** Obtiene la instancia de Auth Admin */
export function getAuthAdmin(): admin.auth.Auth {
  return getFirebaseAdminApp().auth();
}
