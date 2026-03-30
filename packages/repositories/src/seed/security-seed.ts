import { 
  getFirebaseFirestore, 
} from '@terabound/firebase-client';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const DEFAULT_POLICIES = [
  {
    key: 'mfa_platform_admin',
    name: 'MFA Obligatorio para PlatformAdmin',
    description: 'Exige autenticación de dos factores para todos los administradores de plataforma.',
    type: 'auth',
    enabled: true,
    config: { enforceMfa: true }
  },
  {
    key: 'session_timeout',
    name: 'Tiempo de Expiración de Sesión',
    description: 'Define la duración máxima de una sesión inactiva.',
    type: 'session',
    enabled: true,
    config: { timeoutMinutes: 60 }
  },
  {
    key: 'login_attempts',
    name: 'Intentos de Inicio de Sesión',
    description: 'Número máximo de intentos permitidos antes de bloquear la cuenta.',
    type: 'auth',
    enabled: true,
    config: { maxAttempts: 5 }
  }
];

export async function seedSecurityPolicies(): Promise<void> {
  try {
    const db = getFirebaseFirestore();
    const colRef = collection(db, '_gl_security_policies');
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      console.log('[Seed] Inicializando políticas de seguridad por defecto...');
      for (const policy of DEFAULT_POLICIES) {
        await setDoc(doc(db, '_gl_security_policies', policy.key), {
          ...policy,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: 'system',
          updatedBy: 'system'
        });
      }
      console.log('[Seed] Políticas de seguridad inicializadas.');
    }
  } catch (error) {
    console.error('[Seed] Error seeding security policies:', error);
  }
}
