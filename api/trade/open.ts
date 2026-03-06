import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { verifyAuthHeader } from '../../src/utils/jwt.js';
import { TradingService } from '../../src/services/tradingService.js';
import { parseJsonBody } from '../../src/utils/body.js';

const tradingService = new TradingService();

const schema = z.object({
  symbol: z.string().default('BTC/USD'),
  direction: z.enum(['long', 'short']),
  leverage: z.number().min(1).max(1000),
  margin: z.number().positive(),
  currentPrice: z.number().positive(),
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

    const position = await tradingService.openPosition({
      userId,
      ...parsed
    });

    res.status(201).json(position);
  } catch (e: any) {
    console.error(e);
    res.status(400).json({ error: e?.message ?? 'bad_request' });
  }
}