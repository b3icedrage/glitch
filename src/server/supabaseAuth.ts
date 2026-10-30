import { Request, Response, NextFunction } from 'express';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export async function requireSupabaseUser(req: Request, res: Response, next: NextFunction) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ success: false, error: 'Sign in is required.' });
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(503).json({ success: false, error: 'Supabase server verification is not configured.' });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${match[1]}`,
      },
    });
    if (!response.ok) {
      return res.status(401).json({ success: false, error: 'Your session is invalid or expired. Please sign in again.' });
    }
    const user = await response.json() as { id?: string; email?: string; user_metadata?: Record<string, unknown> };
    if (!user.id || !user.email) {
      return res.status(401).json({ success: false, error: 'A verified account email is required.' });
    }
    (req as any).supabaseUser = user;
    return next();
  } catch (error) {
    console.error('[Supabase Auth] Token verification failed:', error);
    return res.status(503).json({ success: false, error: 'Authentication service is temporarily unavailable.' });
  }
}
