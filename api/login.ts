import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { AuthService } from '../src/services/authService.js';
import { parseJsonBody } from '../src/utils/body.js';

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const authService = new AuthService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const body = parseJsonBody(req.body);
    const parsed = schema.parse(body);
    const result = await authService.login(parsed);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(401).json({ error: e?.message ?? 'unauthorized' });
  }
}
