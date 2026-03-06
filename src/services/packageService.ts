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

  async purchasePackage(userId: string, packageId: string) {
    return withTransaction(async (client) => {
      // 1. Get package price
      const p = await client.query(
        `select id, price_sui, name from packages where id = $1 and status = 'active'`,
        [packageId],
      );
      if (p.rowCount === 0) throw new Error('Invalid package');
      const pkg = p.rows[0];
      const price = pkg.price_sui as string;

      // 2. Debit wallet (will throw if insufficient funds)
      await this.wallet.debit(
        client,
        userId,
        'deposit',
        price,
        `Purchase package: ${pkg.name}`,
        { type: 'PACKAGE_PURCHASE', id: packageId },
      );

      // 3. Activate package (reuse existing logic but we need to pass client... 
      //    Wait, activatePackage uses withTransaction which creates a NEW client. 
      //    We should refactor activatePackage to accept an optional client or extract the logic.
      //    For now, I'll duplicate the activation logic here to ensure atomicity within THIS transaction.)
      
      const durationRes = await client.query(
        `select duration_days from packages where id = $1`, 
        [packageId]
      );
      const duration = durationRes.rows[0].duration_days as number;

      const ins = await client.query(
        `insert into user_packages(user_id, package_id, amount, activated_at, expires_at, status)
         values ($1,$2,$3, now(), now() + make_interval(days => $4), 'active')
         returning id`,
        [userId, packageId, price, duration],
      );
      const upId = ins.rows[0].id as string;

      // Update team volumes
      await client.query(
        `update user_team_volume set volume = volume + $2 where user_id in (
           select upline_id from mlm_tree where user_id = $1
         )`,
        [userId, price],
      );

      // Distribute commissions
      await this.engine.distributeCommission(
        client,
        userId,
        price,
        'PACKAGE_COMMISSION',
        { type: 'USER_PACKAGE', id: upId },
      );

      return { userPackageId: upId, status: 'activated', price_deducted: price };
    });
  }
}

