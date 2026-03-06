import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuthHeader } from '../../src/utils/jwt.js';
import { pool } from '../../src/db/pool.js';
import { WalletService } from '../../src/services/walletService.js';

const walletService = new WalletService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const { userId } = verifyAuthHeader(req.headers.authorization);
    const client = await pool.connect();
    try {
      const balances = await walletService.getBalances(client, userId);
      res.status(200).json(balances);
    } finally {
      client.release();
    }
  } catch (e: any) {
    res.status(401).json({ error: e?.message ?? 'unauthorized' });
  }
}
