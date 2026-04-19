const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/shres/OneDrive/Desktop/FYP/gaurav-shrestha-InnSight/server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateSchema() {
  try {
    await pool.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS otp VARCHAR(6)');
    await pool.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMP');
    console.log('Columns added successfully');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

updateSchema();
