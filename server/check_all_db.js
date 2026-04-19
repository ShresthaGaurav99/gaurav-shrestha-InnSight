const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/shres/OneDrive/Desktop/FYP/gaurav-shrestha-InnSight/server/.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkAll() {
  const tables = ['User', 'Staff', 'Room', 'Booking', 'Task'];
  for (const table of tables) {
    const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
    console.log(`${table} columns:`, res.rows.map(r => r.column_name));
  }
  await pool.end();
}
checkAll();
