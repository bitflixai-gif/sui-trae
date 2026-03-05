import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import { config } from './config.js';
import { registerRoutes } from './web/routes.js';
import cron from 'node-cron';
import { runDailyRoiDistribution } from './tasks/roiJob.js';
import { runDailyRankEvaluation } from './tasks/rankJob.js';

async function main() {
  const app = Fastify({ logger: true });
  await app.register(sensible);
  registerRoutes(app);

  if (config.enableInProcessCron) {
    cron.schedule('10 0 * * *', async () => {
      await runDailyRoiDistribution(app.log);
      await runDailyRankEvaluation(app.log);
    });
  }

  await app.listen({ port: config.port, host: '0.0.0.0' });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
