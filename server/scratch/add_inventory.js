const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/shres/OneDrive/Desktop/FYP/gaurav-shrestha-InnSight/server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const items = [
  { item: 'Shampoo (Mini)', quantity: 200, status: 'AVAILABLE' },
  { item: 'Conditioner (Mini)', quantity: 180, status: 'AVAILABLE' },
  { item: 'Toothbrush Kit', quantity: 150, status: 'AVAILABLE' },
  { item: 'Shaving Kit', quantity: 80, status: 'AVAILABLE' },
  { item: 'Toilet Paper Rolls', quantity: 300, status: 'AVAILABLE' },
  { item: 'Pillow Cases', quantity: 120, status: 'AVAILABLE' },
  { item: 'Extra Pillows', quantity: 40, status: 'AVAILABLE' },
  { item: 'Bath Mats', quantity: 60, status: 'AVAILABLE' },
  { item: 'Hangers (Set)', quantity: 100, status: 'AVAILABLE' },
  { item: 'Coffee Sachets', quantity: 500, status: 'AVAILABLE' },
  { item: 'Tea Bags (Green/Black)', quantity: 600, status: 'AVAILABLE' },
  { item: 'Sugar Cubes (Box)', quantity: 40, status: 'LOW_STOCK' },
  { item: 'Bottled Water (1L)', quantity: 240, status: 'AVAILABLE' },
  { item: 'Slippers (Disposable)', quantity: 200, status: 'AVAILABLE' },
  { item: 'Laundry Bags', quantity: 100, status: 'AVAILABLE' },
  { item: 'Glass Cleaner (L)', quantity: 15, status: 'AVAILABLE' },
  { item: 'Disinfectant Spray', quantity: 12, status: 'LOW_STOCK' },
  { item: 'Room Freshener', quantity: 25, status: 'AVAILABLE' }
];

async function addInventory() {
  try {
    console.log('Adding more inventory items...');
    for (const entry of items) {
      // Check if item exists first to avoid duplicates if possible, 
      // though item isn't necessarily unique in schema, we'll just insert.
      await pool.query(
        'INSERT INTO "Inventory" (item, quantity, status, "updatedAt") VALUES ($1, $2, $3, NOW())',
        [entry.item, entry.quantity, entry.status]
      );
    }
    console.log('Successfully added ' + items.length + ' new items to inventory!');
  } catch (err) {
    console.error('Error adding inventory:', err);
  } finally {
    await pool.end();
  }
}

addInventory();
