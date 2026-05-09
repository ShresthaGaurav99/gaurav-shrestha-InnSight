const { Pool } = require('pg');
require('dotenv').config({path: '.env'});
const db = new Pool({connectionString: process.env.DATABASE_URL});

async function fix() {
  await db.query("UPDATE users SET role='staff' WHERE id IN (8, 9, 10)");
  await db.query("UPDATE users SET role='customer' WHERE id IN (11, 12, 16)");
  console.log('Roles updated!');
  process.exit(0);
}
fix().catch(console.error);
