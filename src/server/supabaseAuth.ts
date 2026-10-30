import type { Request, Response, NextFunction } from 'express';

type VercelResponseCompat = Response & {
  status?: (code: number) => VercelResponseCompat;
  json?: (body: unknown) => VercelResponseCompat;
};
type VercelRequestCompat = Request & {
  get?: (name: string) => string | undefined;
  protocol?: string;
};

function addVercelExpressCompatibility(req: VercelRequestCompat, res: VercelResponseCompat) {
  // Vercel Node functions provide Node request/response objects, not Express objects.
  if (typeof res.status !== 'function') {
    res.status = function (code: number) {
      res.statusCode = code;
      return res;
    };
  }
  if (typeof res.json !== 'function') {
    res.json = function (body: unknown) {
      if (!res.headersSent) res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(body));
      return res;
    };
  }
  if (typeof req.get !== 'function') {
    req.get = function (name: string) {
      const value = req.headers[name.toLowerCase()];
      return Array.isArray(value) ? value.join(', ') : value;
    };
  }
  if (!req.protocol) {
    Object.defineProperty(req, 'protocol', {
      configurable: true,
      get: () => {
        const forwarded = req.headers['x-forwarded-proto'];
        const protocol = Array.isArray(forwarded) ? forwarded[0] : forwarded;
        return protocol || 'https';
      },
    });
  }
}

export async function requireSupabaseUser(req: Request, res: Response, next: NextFunction) {
  addVercelExpressCompatibility(req as VercelRequestCompat, res as VercelResponseCompat);

  const rawAuthorization = req.headers.authorization;
  const authorization = Array.isArray(rawAuthorization) ? rawAuthorization[0] || '' : rawAuthorization || '';
  const token = authorization.toLowerCase().startsWith('bearer ') ? authorization.slice(7).trim() : '';
  if (!token) {
    return res.status(401).json({ success: false, error: 'Sign in is required.' });
  }

  const configuredUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';\n  const supabaseUrl = configuredUrl.endsWith('/') ? configuredUrl.slice(0, -1) : configuredUrl;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(503).json({ success: false, error: 'Supabase server verification is not configured.' });
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` },
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
