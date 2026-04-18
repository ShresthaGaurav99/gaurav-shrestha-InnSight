const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/shres/OneDrive/Desktop/FYP/gaurav-shrestha-InnSight/server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  try {
    const res = await pool.query("SELECT COUNT(*) FROM rooms");
    if (parseInt(res.rows[0].count) === 0) {
        console.log('Seeding rooms...');
        await pool.query(`
            INSERT INTO rooms (number, type, price, status, "updatedAt") VALUES
            ('101', 'Deluxe', 3500, 'available', NOW()),
            ('102', 'Deluxe', 3500, 'available', NOW()),
            ('201', 'Suite', 5500, 'available', NOW()),
            ('202', 'Double', 2500, 'available', NOW())
        `);
        console.log('Rooms seeded successfully!');
    } else {
        console.log('Rooms already exist, skipping seed.');
    }
    
    const invRes = await pool.query("SELECT COUNT(*) FROM \"Inventory\"");
    if (parseInt(invRes.rows[0].count) === 0) {
        console.log('Seeding inventory...');
        await pool.query(`
            INSERT INTO "Inventory" (item, quantity, status, "updatedAt") VALUES
            ('Soap', 50, 'LOW_STOCK', NOW()),
            ('Towel', 120, 'AVAILABLE', NOW()),
            ('Bed Sheet', 80, 'AVAILABLE', NOW())
        `);
        console.log('Inventory seeded successfully!');
    }
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await pool.end();
  }
}

seed();
