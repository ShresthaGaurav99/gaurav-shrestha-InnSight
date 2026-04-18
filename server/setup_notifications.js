const { Pool } = require('pg');
require('dotenv').config({ path: 'server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setup() {
  try {
    console.log('Setting up notifications table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'UNREAD',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('notifications table ready!');
    
    // Seed some data if empty
    const res = await pool.query('SELECT COUNT(*) FROM notifications');
    if (parseInt(res.rows[0].count) === 0) {
        await pool.query(`
            INSERT INTO notifications (title, message, status) VALUES
            ('Low Stock Alert', 'Towels are running low.', 'UNREAD'),
            ('New Booking', 'Gaurav scheduled a Deluxe Room.', 'UNREAD')
        `);
        console.log('Seeded notifications.');
    }
  } catch (err) {
    console.error('Setup error:', err);
  } finally {
    await pool.end();
  }
}

setup();
