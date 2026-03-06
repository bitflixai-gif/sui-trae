import { pool } from '../src/db/pool.js';

async function main() {
  try {
    const res = await pool.query('SELECT count(*) FROM packages');
    console.log('Package count:', res.rows[0].count);
    
    if (res.rows[0].count === '0') {
      console.log('Seeding packages...');
      await pool.query(`
        INSERT INTO packages (name, price_sui, roi_percent, duration_days, status) VALUES
        ('Starter', 100, 1.5, 30, 'active'),
        ('Pro', 500, 2.0, 45, 'active'),
        ('Elite', 1000, 2.5, 60, 'active')
        ON CONFLICT (name) DO NOTHING;
      `);
      console.log('Packages seeded!');
    } else {
      const rows = await pool.query('SELECT name, price_sui FROM packages');
      console.log('Existing packages:', rows.rows);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
