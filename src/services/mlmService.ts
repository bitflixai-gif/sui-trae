import { PoolClient } from 'pg';

export class MlmService {
  async getUplines(client: PoolClient, userId: string): Promise<{ upline_id: string; level: number }[]> {
    const res = await client.query(
      `select upline_id, level
       from mlm_tree
       where user_id = $1 and level between 1 and 24
       order by level asc`,
      [userId],
    );
    return res.rows;
  }

  async insertTreeForNewUser(client: PoolClient, userId: string, sponsorId: string | null) {
    if (!sponsorId) return;
    let current = sponsorId;
    for (let level = 1; level <= 24; level++) {
      const sponsorRes = await client.query(
        `select sponsor_id from users where id = $1`,
        [current],
      );
      await client.query(
        `insert into mlm_tree(user_id, upline_id, level) values ($1,$2,$3)
         on conflict (user_id, level) do nothing`,
        [userId, current, level],
      );
      const next = sponsorRes.rows[0]?.sponsor_id as string | null | undefined;
      if (!next) break;
      current = next;
    }
  }
}

