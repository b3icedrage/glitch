import type { Request, Response } from 'express';
import { requireSupabaseUser } from '../../src/server/supabaseAuth.js';
import { handleGetEntitlements } from '../../src/server/kelviq.js';

export default function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }
  return requireSupabaseUser(req, res, () => handleGetEntitlements(req, res));
}
