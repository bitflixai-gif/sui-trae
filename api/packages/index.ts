import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pool } from '../../src/db/pool.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const r = await pool.query(
      `select id, name, price_sui, roi_percent, duration_days, status from packages where status = 'active' order by price_sui asc`,
    );
    res.status(200).json({ packages: r.rows });
  } catch (e: any) {
    res.status(500).json({ error: 'failed' });
  }
}
