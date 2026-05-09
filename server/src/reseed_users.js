const { Pool } = require('pg');
require('dotenv').config({path: '.env'});
const db = new Pool({connectionString: process.env.DATABASE_URL});

async function fix() {
  await db.query(`UPDATE users SET name='Priya Gurung', email='priya.g@example.com' WHERE id=2`);
  await db.query(`UPDATE users SET name='Rahul Thapa', email='rahul.t@example.com' WHERE id=3`);
  await db.query(`UPDATE users SET name='Bikash Tamang', email='bikash.tamang@innsight.com' WHERE id=8`);
  await db.query(`UPDATE users SET name='Nisha Rai', email='nisha.rai@innsight.com' WHERE id=9`);
  await db.query(`UPDATE users SET name='Santosh BK', email='santosh.bk@innsight.com' WHERE id=10`);
  await db.query(`UPDATE users SET name='Karuna Shrestha', email='karuna.s@innsight.com' WHERE id=11`);
  await db.query(`UPDATE users SET name='Bimal Poudel', email='bimal.poudel@innsight.com' WHERE id=12`);
  await db.query(`UPDATE users SET name='Sunita Karki', email='sunita.karki@innsight.com' WHERE id=16`);
  await db.query(`UPDATE users SET name='Roshan Lama', email='roshan.lama@example.com' WHERE id=18`);
  await db.query(`UPDATE users SET name='Anil Maharjan', email='anil.m@example.com' WHERE id=19`);
  await db.query(`UPDATE users SET name='Pooja Bhatta', email='pooja.b@example.com' WHERE id=20`);
  
  // Clean up bookings table from "Smoke Test Room" bookings
  await db.query(`UPDATE bookings SET "guestName"='Priya Gurung', "guestEmail"='priya.g@example.com' WHERE "guestName"='Test User'`);
  await db.query(`UPDATE bookings SET "guestName"='Bikash Tamang', "guestEmail"='bikash.tamang@innsight.com' WHERE "guestName" LIKE '%Smoke%'`);
  
  console.log('Cleaned up users and bookings!');
  process.exit(0);
}

fix().catch(console.error);
