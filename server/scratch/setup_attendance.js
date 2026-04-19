const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        staff_id INT REFERENCES staff(id) ON DELETE CASCADE,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        check_in TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        check_out TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'PRESENT',
        UNIQUE(staff_id, date)
      )
    `);
    console.log('Attendance table created successfully');
  } catch (err) {
    console.error('Error creating attendance table:', err);
  } finally {
    await pool.end();
  }
}

run();
