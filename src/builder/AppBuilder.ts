import Fastify, { FastifyInstance } from 'fastify';
import sensible from '@fastify/sensible';
import { config } from '../config.js';
import { registerRoutes } from '../web/routes.js';
import cron from 'node-cron';
import { runDailyRoiDistribution } from '../tasks/roiJob.js';
import { runDailyRankEvaluation } from '../tasks/rankJob.js';

export class AppBuilder {
  private app: FastifyInstance;
  private withCron: boolean = false;
  private cronJobs: (() => Promise<void>)[] = [];

  constructor() {
    this.app = Fastify({ logger: true });
  }

  withSensible(): AppBuilder {
    this.app.register(sensible);
    return this;
  }

  withRoutes(): AppBuilder {
    registerRoutes(this.app);
    return this;
  }

  withCronJobs(): AppBuilder {
    this.withCron = true;
    return this;
  }

  addCustomCronJob(schedule: string, job: () => Promise<void>): AppBuilder {
    this.cronJobs.push(() => {
      cron.schedule(schedule, job);
      return Promise.resolve();
    });
    return this;
  }

  async build(): Promise<FastifyInstance> {
    // Register sensible plugin if not already done
    try {
      await this.app.register(sensible);
    } catch (error) {
      // Plugin might already be registered
    }

    // Setup cron jobs if enabled
    if (this.withCron && config.enableInProcessCron) {
      // Default cron jobs
      cron.schedule('10 0 * * *', async () => {
        await runDailyRoiDistribution(this.app.log);
        await runDailyRankEvaluation(this.app.log);
      });

      // Custom cron jobs
      for (const job of this.cronJobs) {
        await job();
      }
    }

    return this.app;
  }

  async start(): Promise<FastifyInstance> {
    const app = await this.build();
    await app.listen({ port: config.port, host: '0.0.0.0' });
    return app;
  }
}

export function createApp(): AppBuilder {
  return new AppBuilder();
}