const { Pool } = require('pg');
require('dotenv').config({ path: 'server/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'bookings'").then(r => {
    console.log(r.rows);
    pool.end();
});
