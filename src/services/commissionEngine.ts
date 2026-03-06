import { PoolClient } from 'pg';
import { MlmService } from './mlmService.js';
import { WalletService } from './walletService.js';

type CommissionKind = 'PACKAGE_COMMISSION' | 'ROI_COMMISSION' | 'TRADE_COMMISSION';

export class CommissionEngine {
  private mlm = new MlmService();
  private wallet = new WalletService();

  private commissionTypeToRateType(kind: CommissionKind): 'PACKAGE' | 'ROI' | 'TRADE' {
    return kind === 'PACKAGE_COMMISSION' ? 'PACKAGE' : kind === 'ROI_COMMISSION' ? 'ROI' : 'TRADE';
  }

  async distributeCommission(
    client: PoolClient,
    userId: string,
    baseAmount: string,
    kind: CommissionKind,
    reference: { type: string; id: string },
  ) {
    const uplines = await this.mlm.getUplines(client, userId);
    const rateType = this.commissionTypeToRateType(kind);
    for (const u of uplines) {
      const { upline_id, level } = u;
      const eligible = await this.isUserEligible(client, upline_id);
      if (!eligible) continue;

      const rateRes = await client.query(
        `select percentage from mlm_commissions where type = $1 and level = $2`,
        [rateType, level],
      );
      const pct = rateRes.rows[0]?.percentage as string | undefined;
      if (!pct) continue;
      const commission = await this.multiplyDecimal(baseAmount, pct);
      if (Number(commission) <= 0) continue;

      const exists = await client.query(
        `select 1 from commission_history
         where reference_type = $1 and reference_id = $2 and to_user = $3 and level = $4`,
        [reference.type, reference.id, upline_id, level],
      );
      if (exists.rowCount && exists.rowCount > 0) continue;

      await this.wallet.credit(
        client,
        upline_id,
        'commission',
        commission,
        `${kind} L${level} from ${userId}`,
        reference,
      );
      await client.query(
        `insert into commission_history(from_user, to_user, level, amount, type, reference_type, reference_id)
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [userId, upline_id, level, commission, kind, reference.type, reference.id],
      );
    }
  }

  private async isUserEligible(client: PoolClient, userId: string): Promise<boolean> {
    const res = await client.query(
      `select 1 from user_packages
       where user_id = $1 and status = 'active' and expires_at > now()
       limit 1`,
      [userId],
    );
    return (res.rowCount ?? 0) > 0;
  }

  private async multiplyDecimal(a: string, b: string): Promise<string> {
    const res = await clientQueryDecimalMultiply(a, b);
    return res;
  }
}

async function clientQueryDecimalMultiply(a: string, b: string): Promise<string> {
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
