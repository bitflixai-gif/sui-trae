import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { verifyAuthHeader } from '../../src/utils/jwt.js';
import { pool } from '../../src/db/pool.js';
import { WalletService } from '../../src/services/walletService.js';
import { parseJsonBody } from '../../src/utils/body.js';

const walletService = new WalletService();

const schema = z.object({
  amount: z.string(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const { userId } = verifyAuthHeader(req.headers.authorization);
    const body = parseJsonBody(req.body);
    const parsed = schema.parse(body);

    const client = await pool.connect();
    try {
      await walletService.credit(
        client,
        userId,
        'deposit',
        parsed.amount,
        'Manual Deposit',
        { type: 'MANUAL_DEPOSIT', id: userId }
      );
      res.status(200).json({ ok: true });
    } finally {
      client.release();
    }
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? 'bad_request' });
  }
}
