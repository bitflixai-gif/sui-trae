import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { PackageService } from '../../src/services/packageService.js';

const schema = z.object({
  userId: z.string().uuid(),
  packageId: z.string().uuid(),
  amount: z.string(),
});

const packageService = new PackageService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const parsed = schema.parse(req.body ?? {});
    const result = await packageService.activatePackage(parsed.userId, parsed.packageId, parsed.amount);
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? 'bad_request' });
  }
}

