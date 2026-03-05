import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { UserService } from '../services/userService.js';
import { PackageService } from '../services/packageService.js';
import { runDailyRoiDistribution } from '../tasks/roiJob.js';
import { runDailyRankEvaluation } from '../tasks/rankJob.js';
import { config } from '../config.js';

export function registerRoutes(app: FastifyInstance) {
  const userService = new UserService();
  const packageService = new PackageService();

  app.post('/api/register', async (req, reply) => {
    const schema = z.object({
      username: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(8),
      sponsorReferralCode: z.string().optional(),
    });
    const body = schema.parse(req.body);
    const result = await userService.registerUser(body);
    return reply.code(201).send(result);
  });

  app.post('/api/packages/activate', async (req, reply) => {
    const schema = z.object({
      userId: z.string().uuid(),
      packageId: z.string().uuid(),
      amount: z.string(), // numeric as string to avoid JS float issues
    });
    const body = schema.parse(req.body);
    const res = await packageService.activatePackage(body.userId, body.packageId, body.amount);
    return reply.code(201).send(res);
  });

  app.get('/internal/cron/roi', async (req, reply) => {
    // authorize by token (query ?token= or header x-cron-secret)
    const token = (req.headers['x-cron-secret'] as string | undefined) ?? (req as any).query?.token;
    if (!config.cronSecret || token !== config.cronSecret) {
      return reply.code(401).send({ error: 'unauthorized' });
    }
    await runDailyRoiDistribution(app.log);
    return reply.send({ ok: true });
  });

  app.get('/internal/cron/rank', async (req, reply) => {
    const token = (req.headers['x-cron-secret'] as string | undefined) ?? (req as any).query?.token;
    if (!config.cronSecret || token !== config.cronSecret) {
      return reply.code(401).send({ error: 'unauthorized' });
    }
    await runDailyRankEvaluation(app.log);
    return reply.send({ ok: true });
  });
}
