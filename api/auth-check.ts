import type { Request, Response } from 'express';
import { requireFirebaseUser } from '../src/server/firebaseAuth.js';

export default function handler(req: Request, res: Response) {
  if (req.method !== 'GET') return res.status(405).json({ success: false });
  return requireFirebaseUser(req, res, () => res.status(200).json({ ok: true }));
}
