import { pool } from '../src/db/pool.js';
import { runDailyRoiDistribution } from '../src/tasks/roiJob.js';

const logger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.debug,
  fatal: console.error,
  child: () => logger,
};

async function main() {
  try {
    console.log('--- STARTING MANUAL ROI DISTRIBUTION ---');
    
    // 1. Check current earnings
    const before = await pool.query(`select user_id, earnings_wallet from wallets where earnings_wallet > 0`);
    console.log('Earnings before:', before.rows);

    // 2. Run Job
    await runDailyRoiDistribution(logger as any);

    // 3. Check after
    const after = await pool.query(`select user_id, earnings_wallet from wallets where earnings_wallet > 0`);
    console.log('Earnings after:', after.rows);
    
    console.log('--- ROI DISTRIBUTION COMPLETE ---');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
