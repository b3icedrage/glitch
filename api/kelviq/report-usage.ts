import type { Request, Response } from 'express';
import { requireFirebaseUser } from '../../src/server/firebaseAuth.js';
import { handleReportUsage } from '../../src/server/kelviq.js';

export default function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }
  return requireFirebaseUser(req, res, () => handleReportUsage(req, res));
}
