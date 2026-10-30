import type { Request, Response } from 'express';
import { requireSupabaseUser } from '../src/server/supabaseAuth.js';

export default function handler(req: Request, res: Response) {
  if (req.method !== 'GET') return res.status(405).json({ success: false });
  return requireSupabaseUser(req, res, () => res.status(200).json({ ok: true }));
}
