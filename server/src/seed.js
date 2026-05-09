const { Pool } = require('pg');
require('dotenv').config({ path: '.env' }); // Adjust path if necessary based on execution location
const bcrypt = require('bcryptjs');

const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/innsight'
});

async function seed() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // 1. Clear existing data (optional, maybe we just want to upsert or check if empty)
    const checkRooms = await db.query('SELECT COUNT(*) FROM rooms');
    if (parseInt(checkRooms.rows[0].count) > 0) {
      console.log('✅ Rooms already exist. Skipping seed to prevent duplication.');
      // Still populate menu items if they are empty
    } else {
      console.log('🏨 Seeding rooms...');
      const rooms = [
        { num: '101', title: 'Standard Room', type: 'Standard', price: 4000, cap: 2, bed: 'Queen Bed' },
        { num: '102', title: 'Standard Room', type: 'Standard', price: 4000, cap: 2, bed: 'Queen Bed' },
        { num: '201', title: 'Deluxe City View', type: 'Deluxe', price: 7500, cap: 2, bed: 'King Bed' },
        { num: '202', title: 'Deluxe City View', type: 'Deluxe', price: 7500, cap: 2, bed: 'King Bed' },
        { num: '301', title: 'Executive Suite', type: 'Suite', price: 15000, cap: 4, bed: '1 King, 1 Sofa Bed' },
      ];

      for (const r of rooms) {
        await db.query(
          `INSERT INTO rooms (number, title, type, price, capacity, bed_type, image_urls) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [r.num, r.title, r.type, r.price, r.cap, r.bed, JSON.stringify(['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800'])]
        );
      }
      console.log('✅ Added 5 Rooms.');
    }

    // 2. Menu Seed
    const checkMenu = await db.query('SELECT COUNT(*) FROM menu_items');
    if (parseInt(checkMenu.rows[0].count) > 0) {
      console.log('✅ Menu already exists. Skipping menu seed.');
    } else {
      console.log('🍔 Seeding menu...');
      
      const catRes1 = await db.query('INSERT INTO menu_categories (name, sort_order) VALUES ($1, $2) RETURNING id', ['Breakfast', 1]);
      const catRes2 = await db.query('INSERT INTO menu_categories (name, sort_order) VALUES ($1, $2) RETURNING id', ['Main Course', 2]);
      const catRes3 = await db.query('INSERT INTO menu_categories (name, sort_order) VALUES ($1, $2) RETURNING id', ['Beverages', 3]);

      const items = [
        { cat: catRes1.rows[0].id, name: 'American Breakfast', desc: 'Eggs, bacon, toast, hash browns', price: 1200 },
        { cat: catRes1.rows[0].id, name: 'Pancakes', desc: 'Stack of 3 with maple syrup', price: 850 },
        { cat: catRes2.rows[0].id, name: 'Chicken Biryani', desc: 'Aromatic basmati rice with spiced chicken', price: 950 },
        { cat: catRes2.rows[0].id, name: 'Margarita Pizza', desc: 'Wood-fired classic pizza', price: 1100 },
        { cat: catRes3.rows[0].id, name: 'Fresh Watermelon Juice', desc: 'Freshly squeezed', price: 400 },
        { cat: catRes3.rows[0].id, name: 'Cappuccino', desc: 'Hot espresso and milk', price: 350 },
      ];

      for (const i of items) {
        await db.query(
          `INSERT INTO menu_items (category_id, name, description, price) VALUES ($1, $2, $3, $4)`,
          [i.cat, i.name, i.desc, i.price]
        );
      }
      console.log('✅ Added Menu Categories and Items.');
    }

    console.log('🎉 Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
