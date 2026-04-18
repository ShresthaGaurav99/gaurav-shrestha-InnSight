const db = require('../config/db');
const { roomSeeds, menuCategories, menuItemSeeds } = require('../data/seedData');

const createBaseTables = async () => {
  await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await db.query(`
    CREATE TABLE IF NOT EXISTS menu_categories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) UNIQUE NOT NULL,
      sort_order INTEGER DEFAULT 0,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
      name VARCHAR(120) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL DEFAULT 0,
      image_url TEXT,
      is_veg BOOLEAN DEFAULT true,
      spice_level VARCHAR(20) DEFAULT 'Mild',
      is_available BOOLEAN DEFAULT true,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const alterTables = async () => {
  const statements = [
    `ALTER TABLE rooms ADD COLUMN IF NOT EXISTS title VARCHAR(120)`,
    `ALTER TABLE rooms ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 2`,
    `ALTER TABLE rooms ADD COLUMN IF NOT EXISTS bed_type VARCHAR(60)`,
    `ALTER TABLE rooms ADD COLUMN IF NOT EXISTS size_sqft INTEGER`,
    `ALTER TABLE rooms ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE rooms ADD COLUMN IF NOT EXISTS description TEXT`,
    `ALTER TABLE rooms ADD COLUMN IF NOT EXISTS policies JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE rooms ADD COLUMN IF NOT EXISTS location VARCHAR(120) DEFAULT 'Kathmandu, Nepal'`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS nights INTEGER DEFAULT 1`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "guestCount" INTEGER DEFAULT 1`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "roomRate" DECIMAL(10, 2) DEFAULT 0`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "vatAmount" DECIMAL(10, 2) DEFAULT 0`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "totalAmount" DECIMAL(10, 2) DEFAULT 0`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "paymentStatus" VARCHAR(20) DEFAULT 'PENDING'`,
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway VARCHAR(30) DEFAULT 'CASH'`,
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS reference_type VARCHAR(30) DEFAULT 'BOOKING'`,
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS reference_id UUID`,
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider_payload JSONB DEFAULT '{}'::jsonb`,
    `ALTER TABLE room_service ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL`,
    `ALTER TABLE room_service ADD COLUMN IF NOT EXISTS menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL`,
    `ALTER TABLE room_service ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1`,
    `ALTER TABLE room_service ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) DEFAULT 0`,
    `ALTER TABLE room_service ADD COLUMN IF NOT EXISTS special_request TEXT`,
    `ALTER TABLE room_service ADD COLUMN IF NOT EXISTS guest_name VARCHAR(100)`,
    `ALTER TABLE room_service ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'PENDING'`,
    `ALTER TABLE room_service ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`
  ];

  for (const statement of statements) {
    await db.query(statement);
  }

  await db.query(`
    ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check
  `);
  await db.query(`
    ALTER TABLE bookings
    ADD CONSTRAINT bookings_status_check
    CHECK (status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'COMPLETED'))
  `);
};

const seedRooms = async () => {
  const roomCount = await db.query('SELECT COUNT(*)::int AS count FROM rooms');
  if (roomCount.rows[0].count > 0) {
    return;
  }

  for (const room of roomSeeds) {
    await db.query(
      `INSERT INTO rooms
       (number, title, type, price, status, capacity, bed_type, size_sqft, amenities, description, policies, image_urls, location, "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11::jsonb, $12::jsonb, $13, NOW())`,
      [
        room.number,
        room.title,
        room.type,
        room.price,
        room.status,
        room.capacity,
        room.bed_type,
        room.size_sqft,
        JSON.stringify(room.amenities),
        room.description,
        JSON.stringify(room.policies),
        JSON.stringify(room.image_urls),
        'Kathmandu, Nepal',
      ]
    );
  }
};

const seedMenu = async () => {
  const categoryCount = await db.query('SELECT COUNT(*)::int AS count FROM menu_categories');
  if (categoryCount.rows[0].count === 0) {
    for (let index = 0; index < menuCategories.length; index += 1) {
      await db.query(
        `INSERT INTO menu_categories (name, sort_order, "updatedAt")
         VALUES ($1, $2, NOW())`,
        [menuCategories[index], index + 1]
      );
    }
  }

  const itemCount = await db.query('SELECT COUNT(*)::int AS count FROM menu_items');
  if (itemCount.rows[0].count > 0) {
    return;
  }

  for (const item of menuItemSeeds) {
    const category = await db.query('SELECT id FROM menu_categories WHERE name = $1', [item.category_name]);
    await db.query(
      `INSERT INTO menu_items
       (category_id, name, description, price, image_url, is_veg, spice_level, is_available, "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())`,
      [
        category.rows[0]?.id || null,
        item.name,
        item.description,
        item.price,
        item.image_url,
        item.is_veg,
        item.spice_level,
      ]
    );
  }
};

const initDatabase = async () => {
  try {
    await createBaseTables();
    await alterTables();
    await seedRooms();
    await seedMenu();
    console.log('Hotel bootstrap complete');
  } catch (error) {
    console.error('Failed to bootstrap hotel data:', error);
  }
};

module.exports = {
  initDatabase,
};
