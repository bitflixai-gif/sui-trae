import { PoolClient } from 'pg';

type WalletType = 'deposit' | 'earnings' | 'commission';

export class WalletService {
  async ensureWallet(client: PoolClient, userId: string) {
    await client.query(
      `insert into wallets(user_id) values ($1)
       on conflict (user_id) do nothing`,
      [userId],
    );
  }

  async credit(
    client: PoolClient,
    userId: string,
    wallet: WalletType,
    amount: string,
    memo: string,
    reference?: { type: string; id: string },
  ) {
    if (Number(amount) <= 0) throw new Error('Amount must be positive');
    await this.ensureWallet(client, userId);
    const col =
      wallet === 'deposit'
        ? 'deposit_wallet'
        : wallet === 'earnings'
        ? 'earnings_wallet'
        : 'commission_wallet';
    const upd = await client.query(
      `update wallets
         set ${col} = ${col} + $2::numeric,
             updated_at = now()
       where user_id = $1
       returning ${col} as balance`,
      [userId, amount],
    );
    const balanceAfter = upd.rows[0]?.balance as string;
    await client.query(
      `insert into wallet_transactions(user_id, wallet_type, direction, amount, balance_after, memo, reference_type, reference_id)
       values ($1,$2,'credit',$3,$4,$5,$6,$7)`,
      [userId, wallet, amount, balanceAfter, memo, reference?.type ?? null, reference?.id ?? null],
    );
  }
}

