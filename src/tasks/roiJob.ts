import { pool, withTransaction } from '../db/pool.js';
import { WalletService } from '../services/walletService.js';
import { CommissionEngine } from '../services/commissionEngine.js';
import { FastifyBaseLogger } from 'fastify';

const wallet = new WalletService();
const engine = new CommissionEngine();

export async function runDailyRoiDistribution(log: FastifyBaseLogger) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `select up.id as user_package_id, up.user_id, up.amount, p.roi_percent
       from user_packages up
       join packages p on p.id = up.package_id
       where up.status = 'active' and up.expires_at > now()`,
    );
    for (const row of res.rows) {
      const upId = row.user_package_id as string;
      const userId = row.user_id as string;
      const amount = row.amount as string;
      const roiPct = row.roi_percent as string;
      await withTransaction(async (tx) => {
        const dailyRoi = await multiply(amount, roiPct);
        if (Number(dailyRoi) <= 0) return;
        await wallet.credit(
          tx,
          userId,
          'earnings',
          dailyRoi,
          `Daily ROI for package ${upId}`,
          { type: 'DAILY_ROI', id: upId },
        );
        await engine.distributeCommission(
          tx,
          userId,
          dailyRoi,
          'ROI_COMMISSION',
          { type: 'DAILY_ROI', id: upId },
        );
      });
    }
  } catch (e: any) {
    log.error({ err: e }, 'ROI distribution failed');
  } finally {
    client.release();
  }
}

async function multiply(a: string, b: string): Promise<string> {
  const scale = 18n;
  const toScaled = (v: string) => {
    const [i, f = ''] = v.split('.');
    const frac = (f + '0'.repeat(Number(scale))).slice(0, Number(scale));
    return BigInt(i) * 10n ** scale + BigInt(frac);
  };
  const A = toScaled(a);
  const B = toScaled(b);
  const scaled = (A * B) / 10n ** scale;
  const intPart = scaled / 10n ** scale;
  const fracPart = (scaled % 10n ** scale).toString().padStart(Number(scale), '0').replace(/0+$/, '');
  return fracPart.length ? `${intPart.toString()}.${fracPart}` : intPart.toString();
}
