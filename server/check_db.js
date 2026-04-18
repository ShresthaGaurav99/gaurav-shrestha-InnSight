const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/shres/OneDrive/Desktop/FYP/gaurav-shrestha-InnSight/server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables Raw:', res.rows.map(r => r.table_name));
    
    // Check if "Room" exists vs "rooms"
    const roomRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name ILIKE 'room%'");
    console.log('Room variants:', roomRes.rows.map(r => r.table_name));
    
    const bookingRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name ILIKE 'booking%'");
    console.log('Booking variants:', bookingRes.rows.map(r => r.table_name));

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
