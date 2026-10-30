import type { Request, Response } from 'express';
import { requireSupabaseUser } from '../../src/server/supabaseAuth';
import { handleCheckout } from '../../src/server/kelviq';

export default function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }
  return requireSupabaseUser(req, res, () => handleCheckout(req, res));
}
