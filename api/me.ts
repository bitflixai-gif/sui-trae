import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuthHeader } from '../src/utils/jwt.js';
import { pool } from '../src/db/pool.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const auth = verifyAuthHeader(req.headers['authorization'] as string | undefined);
    const r = await pool.query(
      `select id, username, email, role, referral_code, sponsor_id, created_at from users where id = $1`,
      [auth.userId],
    );
    const user = r.rows[0];
    if (!user) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    res.status(200).json({ user });
  } catch (e: any) {
    res.status(401).json({ error: 'unauthorized' });
  }
}
