const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setup() {
  const client = await pool.connect();
  try {
    console.log('Creating payments table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Payment" (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES "User"(id),
        "bookingId" INTEGER REFERENCES "Booking"(id),
        amount DECIMAL(10, 2) NOT NULL,
        method VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        "transactionId" VARCHAR(100) UNIQUE,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Payments table created successfully.');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
