import type { Request, Response, NextFunction } from 'express';
import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let firebaseAdminApp: App | null = null;

function getFirebaseAdminApp(): App {
  if (firebaseAdminApp) return firebaseAdminApp;
  const existing = getApps()[0];
  if (existing) {
    firebaseAdminApp = existing;
    return existing;
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured on the server.');
  const serviceAccount = JSON.parse(raw);
  firebaseAdminApp = initializeApp({ credential: cert(serviceAccount) });
  return firebaseAdminApp;
}

export async function requireFirebaseUser(req: Request, res: Response, next: NextFunction) {
  const raw = req.headers.authorization;
  const authorization = Array.isArray(raw) ? (raw[0] || '') : (raw || '');
  const token = authorization.toLowerCase().startsWith('bearer ') ? authorization.slice(7).trim() : '';
  if (!token) return res.status(401).json({ success: false, error: 'Sign in is required.' });

  try {
    const decoded = await getAuth(getFirebaseAdminApp()).verifyIdToken(token, true);
    if (!decoded.uid || !decoded.email) {
      return res.status(401).json({ success: false, error: 'A verified account email is required.' });
    }
    (req as any).firebaseUser = decoded;
    return next();
  } catch (error) {
    console.error('[Firebase Auth] Token verification failed:', error);
    const message = error instanceof Error && error.message.includes('FIREBASE_SERVICE_ACCOUNT_JSON')
      ? 'Firebase server verification is not configured.'
      : 'Your session is invalid or expired. Please sign in again.';
    return res.status(message.includes('not configured') ? 503 : 401).json({ success: false, error: message });
  }
}
