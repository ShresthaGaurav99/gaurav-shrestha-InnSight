const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/shres/OneDrive/Desktop/FYP/gaurav-shrestha-InnSight/server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const staffMembers = [
  { name: 'Arjun Thapa', position: 'Head Chef', email: 'arjun@innsight.com' },
  { name: 'Sita Sharma', position: 'Housekeeping Supervisor', email: 'sita@innsight.com' },
  { name: 'Rohan Joshi', position: 'Front Desk Associate', email: 'rohan@innsight.com' },
  { name: 'Maya Rai', position: 'Maintenance Technician', email: 'maya@innsight.com' },
  { name: 'Deepak Bhattarai', position: 'Waiter', email: 'deepak@innsight.com' },
  { name: 'Anjali Gurung', position: 'Concierge', email: 'anjali@innsight.com' }
];

const roomServiceOrders = [
  { room_number: '201', item: 'American Breakfast', price: 650, status: 'PENDING' },
  { room_number: '305', item: 'Club Sandwich with Fries', price: 480, status: 'PREPARING' },
  { room_number: '202', item: 'Hot Lemon with Honey', price: 120, status: 'DELIVERED' },
  { room_number: '501', item: 'Sparkling Water (Large)', price: 180, status: 'PENDING' },
  { room_number: '402', item: 'Chicken Fried Rice', price: 350, status: 'PREPARING' },
  { room_number: '101', item: 'Evening Tea & Biscuits', price: 150, status: 'DELIVERED' }
];

async function expandData() {
  try {
    console.log('Adding more Staff members...');
    for (const s of staffMembers) {
      // Note: your table is 'staff' (lowercase) or 'Staff' (Prisma)
      // I'll check common names. schema.sql said 'staff' (lowercase).
      await pool.query(
        'INSERT INTO staff (name, position, email, "updatedAt") VALUES ($1, $2, $3, NOW()) ON CONFLICT (email) DO NOTHING',
        [s.name, s.position, s.email]
      );
    }

    console.log('Adding more Room Service orders...');
    for (const r of roomServiceOrders) {
      await pool.query(
        'INSERT INTO room_service (room_number, item, price, status) VALUES ($1, $2, $3, $4)',
        [r.room_number, r.item, r.price, r.status]
      );
    }

    console.log('Successfully expanded Staff and Room Service data!');
  } catch (err) {
    console.error('Error expanding data:', err);
  } finally {
    await pool.end();
  }
}

expandData();
