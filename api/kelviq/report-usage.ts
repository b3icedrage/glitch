import type { Request, Response } from 'express';
import { requireFirebaseUser } from '../../src/server/firebaseAuth.js';
import { handleReportUsage } from '../../src/server/kelviq.js';

export default function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', 'https://b3icedrage.github.io');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }
  return requireFirebaseUser(req, res, () => handleReportUsage(req, res));
}
