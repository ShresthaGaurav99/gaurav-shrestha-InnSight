const { Pool } = require('pg');
require('dotenv').config({ path: 'server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setup() {
  try {
    console.log('Setting up room_service table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS room_service (
        id SERIAL PRIMARY KEY,
        room_number VARCHAR(10) NOT NULL,
        item VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('room_service table ready!');
    
    // Seed some data if empty
    const res = await pool.query('SELECT COUNT(*) FROM room_service');
    if (parseInt(res.rows[0].count) === 0) {
        await pool.query(`
            INSERT INTO room_service (room_number, item, price, status) VALUES
            ('101', 'Chicken Momo (10 pcs)', 250, 'PREPARING'),
            ('102', 'Nepali Khana Set (Thali)', 450, 'DELIVERED')
        `);
        console.log('Seeded room service orders.');
    }
  } catch (err) {
    console.error('Setup error:', err);
  } finally {
    await pool.end();
  }
}

setup();
