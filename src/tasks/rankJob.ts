import { pool } from '../db/pool.js';
import { FastifyBaseLogger } from 'fastify';

export async function runDailyRankEvaluation(log: FastifyBaseLogger) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `select user_id, volume from user_team_volume`,
    );
    for (const row of res.rows) {
      const uid = row.user_id as string;
      const vol = Number(row.volume as string);
      const rank =
        vol >= 5_000_000 ? 7 :
        vol >= 1_000_000 ? 6 :
        vol >= 500_000 ? 5 :
        vol >= 200_000 ? 4 :
        vol >= 50_000 ? 3 :
        vol >= 10_000 ? 2 :
        vol >= 1_000 ? 1 : 0;
      await client.query(
        `insert into user_ranks(user_id, rank, evaluated_at)
         values ($1, $2, now())
         on conflict (user_id) do update set rank = excluded.rank, evaluated_at = excluded.evaluated_at`,
        [uid, rank],
      );
    }
  } catch (e: any) {
    log.error({ err: e }, 'Rank evaluation failed');
  } finally {
    client.release();
  }
}

