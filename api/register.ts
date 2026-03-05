import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { UserService } from '../src/services/userService.js';

const schema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  sponsorReferralCode: z.string().optional(),
});

const userService = new UserService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const parsed = schema.parse(req.body ?? {});
    const result = await userService.registerUser(parsed);
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? 'bad_request' });
  }
}

