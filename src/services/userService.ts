import { withTransaction } from '../db/pool.js';
import { z } from 'zod';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { MlmService } from './mlmService.js';

const registerSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  sponsorReferralCode: z.string().optional(),
});

export class UserService {
  private mlm = new MlmService();

  async registerUser(input: z.infer<typeof registerSchema>) {
    const data = registerSchema.parse(input);
    const password_hash = await argon2.hash(data.password);
    const referral_code = this.generateReferralCode();

    return withTransaction(async (client) => {
      let sponsorId: string | null = null;
      if (data.sponsorReferralCode) {
        const sponsorRes = await client.query(
          `select id from users where referral_code = $1`,
          [data.sponsorReferralCode],
        );
        sponsorId = sponsorRes.rows[0]?.id ?? null;
      }

      const ins = await client.query(
        `insert into users(username, email, password_hash, referral_code, sponsor_id)
         values ($1,$2,$3,$4,$5) returning id, username, email, referral_code, sponsor_id, created_at`,
        [data.username, data.email, password_hash, referral_code, sponsorId],
      );
      const user = ins.rows[0];

      await client.query(`insert into wallets(user_id) values ($1) on conflict do nothing`, [user.id]);
      await client.query(
        `insert into user_team_volume(user_id) values ($1) on conflict do nothing`,
        [user.id],
      );
      await client.query(`insert into user_ranks(user_id) values ($1) on conflict do nothing`, [
        user.id,
      ]);

      if (sponsorId) {
        if (sponsorId === user.id) {
          throw new Error('Self-referral not allowed');
        }
        await this.mlm.insertTreeForNewUser(client, user.id, sponsorId);
      }

      return user;
    });
  }

  private generateReferralCode() {
    return uuidv4().split('-')[0];
  }
}
