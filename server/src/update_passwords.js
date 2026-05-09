const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({path: '.env'});

const db = new Pool({connectionString: process.env.DATABASE_URL});
const hash = bcrypt.hashSync('password123', 10);

async function fix() {
  await db.query(`UPDATE users SET password=$1 WHERE email NOT LIKE '%shrestha%' AND email NOT LIKE '%admin%'`, [hash]);
  
  const res = await db.query(`SELECT email, role FROM users WHERE role='staff'`);
  console.log('STAFF EMAILS:', res.rows.map(r => r.email));
  
  process.exit(0);
}

fix().catch(console.error);
