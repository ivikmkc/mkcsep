import { cert, getApps, initializeApp, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

function parseServiceAccountFromEnv(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;

  const candidates = [raw];
  if (!raw.startsWith('{')) {
    try {
      candidates.push(Buffer.from(raw, 'base64').toString('utf8'));
    } catch {
      // ignore invalid base64
    }
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object' && parsed.private_key && parsed.client_email) {
        if (typeof parsed.private_key === 'string') {
          parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
        }
        return parsed as ServiceAccount;
      }
    } catch {
      // try next candidate
    }
  }

  console.warn('FIREBASE_SERVICE_ACCOUNT_JSON is set but could not be parsed as valid service account JSON.');
  return null;
}

const serviceAccount = parseServiceAccountFromEnv();
export const hasAdminServiceAccount = Boolean(serviceAccount);

const app = getApps().length
  ? getApps()[0]
  : serviceAccount
  ? initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId || firebaseConfig.projectId,
    })
  : initializeApp({
      projectId: firebaseConfig.projectId,
    });

export const adminAuth = getAuth(app);
export const adminDb: Firestore | null = hasAdminServiceAccount
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : null;
