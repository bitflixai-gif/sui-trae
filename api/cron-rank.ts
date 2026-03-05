import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runDailyRankEvaluation } from '../src/tasks/rankJob.js';

const logger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.debug,
  fatal: console.error,
  child: () => logger,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isVercelCron = !!req.headers['x-vercel-cron'];
  if (!isVercelCron) {
    const token = (req.query?.token as string | undefined) ?? (req.headers['x-cron-secret'] as string | undefined);
    const secret = process.env.CRON_SECRET ?? '';
    if (!secret || token !== secret) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
  }
  try {
    await runDailyRankEvaluation(logger as any);
    res.status(200).json({ ok: true });
  } catch (e: any) {
    logger.error(e);
    res.status(500).json({ error: 'failed' });
  }
}
