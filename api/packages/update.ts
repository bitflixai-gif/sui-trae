import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { verifyAuthHeader } from '../../src/utils/jwt.js';
import { pool } from '../../src/db/pool.js';
import { parseJsonBody } from '../../src/utils/body.js';

const schema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  price_sui: z.string().optional(),
  roi_percent: z.string().optional(),
  duration_days: z.number().int().positive().optional(),
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
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    const push = (k: string, v: any) => {
      fields.push(`${k} = $${idx++}`);
      values.push(v);
    };
    if (input.name != null) push('name', input.name);
    if (input.price_sui != null) push('price_sui', input.price_sui);
    if (input.roi_percent != null) push('roi_percent', input.roi_percent);
    if (input.duration_days != null) push('duration_days', input.duration_days);
    if (input.status != null) push('status', input.status);
    if (fields.length === 0) {
      res.status(400).json({ error: 'no_fields' });
      return;
    }
    values.push(input.id);
    const q = `update packages set ${fields.join(', ')} where id = $${idx} returning id`;
    const r = await pool.query(q, values);
    if (r.rowCount === 0) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    res.status(200).json({ id: r.rows[0].id });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? 'bad_request' });
  }
}
