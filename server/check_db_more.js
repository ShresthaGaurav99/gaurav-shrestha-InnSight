const { Pool } = require('pg');
require('dotenv').config({ path: 'server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
  try {
    const tables = ['staff', 'tasks', 'payments', 'rooms', 'bookings', 'users']; // Checking these specifically
    for (const table of tables) {
        const columns = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
        console.log(`Columns in ${table}:`, columns.rows.map(c => c.column_name));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
