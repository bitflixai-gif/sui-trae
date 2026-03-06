import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { verifyAuthHeader } from '../../src/utils/jwt.js';
import { PackageService } from '../../src/services/packageService.js';
import { parseJsonBody } from '../../src/utils/body.js';

const packageService = new PackageService();

const schema = z.object({
  packageId: z.string().uuid(),
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

    const result = await packageService.purchasePackage(userId, parsed.packageId);
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? 'bad_request' });
  }
}
