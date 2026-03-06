import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { verifyAuthHeader } from '../../src/utils/jwt.js';
import { pool } from '../../src/db/pool.js';
import { parseJsonBody } from '../../src/utils/body.js';

const schema = z.object({
  name: z.string().min(1),
  price_sui: z.string(),
  roi_percent: z.string(),
  duration_days: z.number().int().positive(),
  status: z.enum(['active', 'inactive']).optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const auth = verifyAuthHeader(req.headers['authorization'] as string | undefined);
    const ur = await pool.query(`select role from users where id = $1`, [auth.userId]);
    const role = ur.rows[0]?.role as string | undefined;
    if (role !== 'admin' && role !== 'superadmin') {
      res.status(403).json({ error: 'forbidden' });
      return;
    }
    const body = parseJsonBody(req.body);
    const input = schema.parse(body);
    const status = input.status ?? 'active';
    const r = await pool.query(
      `insert into packages(name, price_sui, roi_percent, duration_days, status)
       values ($1,$2,$3,$4,$5) returning id`,
      [input.name, input.price_sui, input.roi_percent, input.duration_days, status],
    );
    res.status(201).json({ id: r.rows[0].id });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? 'bad_request' });
  }
}
