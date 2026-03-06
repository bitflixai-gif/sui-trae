import pg from 'pg';
const { Pool } = pg;

const connectionString = "postgres://default:Vm9eL8lzPwoU@ep-bold-sun-a4778114-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require";

async function main() {
  const pool = new Pool({ connectionString });
  try {
    const res = await pool.query('SELECT now()');
    console.log('Connected!', res.rows[0]);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await pool.end();
  }
}

main();
