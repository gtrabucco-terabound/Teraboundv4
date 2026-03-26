// ============================================================
// @terabound/firebase-client — Singleton Pattern
// Requisito: §3.2 de la spec + Master Plan Fase 1
// Garantiza una ÚNICA instancia de Firebase por runtime.
// ============================================================

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Configuración Firebase — se inyecta por env o se lee de _gl_platform_config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
};

/** Obtiene la instancia Singleton de FirebaseApp */
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

/** Obtiene la instancia Singleton de Auth */
export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

/** Obtiene la instancia Singleton de Firestore */
export function getFirebaseFirestore(): Firestore {
  return getFirestore(getFirebaseApp());
}

// Re-exports de utilidad
export { firebaseConfig };
