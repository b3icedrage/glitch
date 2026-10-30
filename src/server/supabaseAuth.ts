import type { Request, Response, NextFunction } from 'express';

export async function requireSupabaseUser(req: Request, res: Response, next: NextFunction) {
  // Use native Node headers so this works in both Express and Vercel functions.
  const rawAuthorization = req.headers.authorization;
  const authorization = Array.isArray(rawAuthorization) ? rawAuthorization[0] || '' : rawAuthorization || '';
  const match = authorization.match(/^Bearer\\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ success: false, error: 'Sign in is required.' });
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\\/$/, '');
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(503).json({ success: false, error: 'Supabase server verification is not configured.' });
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${match[1]}` },
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
