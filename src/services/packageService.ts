import { withTransaction } from '../db/pool.js';
import { WalletService } from './walletService.js';
import { CommissionEngine } from './commissionEngine.js';

export class PackageService {
  private wallet = new WalletService();
  private engine = new CommissionEngine();

  async activatePackage(userId: string, packageId: string, amount: string) {
    return withTransaction(async (client) => {
      // Verify package exists and active
      const p = await client.query(
        `select id, duration_days from packages where id = $1 and status = 'active'`,
        [packageId],
      );
      if (p.rowCount === 0) throw new Error('Invalid package');
      const duration = p.rows[0].duration_days as number;

      const ins = await client.query(
        `insert into user_packages(user_id, package_id, amount, activated_at, expires_at, status)
         values ($1,$2,$3, now(), now() + make_interval(days => $4), 'active')
         returning id`,
        [userId, packageId, amount, duration],
      );
      const upId = ins.rows[0].id as string;

      // Update team volumes up the tree
      await client.query(
        `update user_team_volume set volume = volume + $2 where user_id in (
           select upline_id from mlm_tree where user_id = $1
         )`,
        [userId, amount],
      );

      // Trigger package commission distribution
      await this.engine.distributeCommission(
        client,
        userId,
        amount,
        'PACKAGE_COMMISSION',
        { type: 'USER_PACKAGE', id: upId },
      );

      return { userPackageId: upId };
    });
  }
}

