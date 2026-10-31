import type { Request, Response } from 'express';
import { requireFirebaseUser } from '../../src/server/firebaseAuth.js';
import { handleGetEntitlements } from '../../src/server/kelviq.js';

export default function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', 'https://b3icedrage.github.io');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }
  return requireFirebaseUser(req, res, () => handleGetEntitlements(req, res));
}
