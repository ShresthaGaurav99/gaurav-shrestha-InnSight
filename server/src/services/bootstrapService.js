const db = require('../config/db');
const { roomSeeds, menuCategories, menuItemSeeds } = require('../data/seedData');

const createTables = async () => {
  await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // 1. Users
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) CHECK (role IN ('customer', 'staff', 'manager')) NOT NULL,
      otp VARCHAR(10),
      otp_expires TIMESTAMP WITH TIME ZONE,
      reset_otp VARCHAR(10),
      reset_otp_expires TIMESTAMP WITH TIME ZONE,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Rooms
  await db.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      number VARCHAR(10) UNIQUE NOT NULL,
      type VARCHAR(50) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      status VARCHAR(20) DEFAULT 'AVAILABLE',
      capacity INTEGER DEFAULT 2,
      title VARCHAR(120),
      bed_type VARCHAR(60),
      size_sqft INTEGER,
      amenities JSONB DEFAULT '[]'::jsonb,
      description TEXT,
      policies JSONB DEFAULT '[]'::jsonb,
      image_urls JSONB DEFAULT '[]'::jsonb,
      location VARCHAR(120) DEFAULT 'Kathmandu, Nepal',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Bookings
  await db.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "roomId" UUID REFERENCES rooms(id) ON DELETE CASCADE,
      "guestName" VARCHAR(100) NOT NULL,
      "guestEmail" VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      "checkIn" DATE NOT NULL,
      "checkOut" DATE NOT NULL,
      "totalAmount" DECIMAL(10, 2) NOT NULL,
      status VARCHAR(20) DEFAULT 'CONFIRMED',
      "paymentStatus" VARCHAR(20) DEFAULT 'PENDING',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id),
      booking_id UUID REFERENCES bookings(id),
      amount DECIMAL(10, 2) NOT NULL,
      method VARCHAR(50) DEFAULT 'CASH',
      status VARCHAR(30) DEFAULT 'UNPAID',
      transaction_id VARCHAR(100),
      gateway VARCHAR(30) DEFAULT 'CASH',
      reference_type VARCHAR(30) DEFAULT 'BOOKING',
      reference_id UUID,
      provider_payload JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. Tasks
  await db.query(`
    CREATE TABLE IF NOT EXISTS staff (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      position VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(200) NOT NULL,
      description TEXT,
      status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN-PROGRESS', 'COMPLETED')),
      "staffId" UUID,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5. Menu
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

  // 6. Attendance/Staff (Simplified for MVP)
  await db.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      staff_id UUID REFERENCES staff(id),
      date DATE DEFAULT CURRENT_DATE,
      check_in TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      check_out TIMESTAMP WITH TIME ZONE,
      status VARCHAR(20) DEFAULT 'PRESENT',
      UNIQUE(staff_id, date)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS "Inventory" (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(120) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(30) NOT NULL DEFAULT 'OUT_OF_STOCK',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query('ALTER TABLE "Inventory" ADD COLUMN IF NOT EXISTS name VARCHAR(120)');
  await db.query('ALTER TABLE "Inventory" ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0');
  await db.query('ALTER TABLE "Inventory" ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT \'OUT_OF_STOCK\'');
  await db.query('ALTER TABLE "Inventory" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP');

  await db.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(200) NOT NULL,
      message TEXT,
      status VARCHAR(20) DEFAULT 'UNREAD',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS room_service (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      room_number VARCHAR(10),
      booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
      menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
      item VARCHAR(120) NOT NULL,
      price DECIMAL(10, 2) NOT NULL DEFAULT 0,
      quantity INTEGER DEFAULT 1,
      total_amount DECIMAL(10, 2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'PENDING',
      special_request TEXT,
      guest_name VARCHAR(100),
      payment_status VARCHAR(20) DEFAULT 'PENDING',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Backward-compatible schema alignment for existing databases.
  await db.query('ALTER TABLE rooms ADD COLUMN IF NOT EXISTS number VARCHAR(10)');
  await db.query('ALTER TABLE rooms ADD COLUMN IF NOT EXISTS title VARCHAR(120)');
  await db.query('ALTER TABLE rooms ADD COLUMN IF NOT EXISTS bed_type VARCHAR(60)');
  await db.query('ALTER TABLE rooms ADD COLUMN IF NOT EXISTS size_sqft INTEGER');
  await db.query('ALTER TABLE rooms ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT \'[]\'::jsonb');
  await db.query('ALTER TABLE rooms ADD COLUMN IF NOT EXISTS description TEXT');
  await db.query('ALTER TABLE rooms ADD COLUMN IF NOT EXISTS policies JSONB DEFAULT \'[]\'::jsonb');
  await db.query('ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT \'[]\'::jsonb');
  await db.query('ALTER TABLE rooms ADD COLUMN IF NOT EXISTS location VARCHAR(120) DEFAULT \'Kathmandu, Nepal\'');
  await db.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'rooms' AND column_name = 'room_number'
      ) THEN
        EXECUTE 'UPDATE rooms SET number = room_number WHERE number IS NULL AND room_number IS NOT NULL';
      END IF;
    END
    $$;
  `);
  await db.query('CREATE UNIQUE INDEX IF NOT EXISTS rooms_number_unique_idx ON rooms(number)');

  await db.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS phone VARCHAR(20)');
  await db.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS nights INTEGER DEFAULT 1');
  await db.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "guestCount" INTEGER DEFAULT 1');
  await db.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "roomRate" DECIMAL(10, 2) DEFAULT 0');
  await db.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "vatAmount" DECIMAL(10, 2) DEFAULT 0');
  await db.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "totalAmount" DECIMAL(10, 2) DEFAULT 0');
  await db.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "paymentStatus" VARCHAR(20) DEFAULT \'PENDING\'');

  await db.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway VARCHAR(30) DEFAULT \'CASH\'');
  await db.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS reference_type VARCHAR(30) DEFAULT \'BOOKING\'');
  await db.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS reference_id UUID');
  await db.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider_payload JSONB DEFAULT \'{}\'::jsonb');

  await db.query(`
    DO $$
    DECLARE fk_name TEXT;
    BEGIN
      SELECT tc.constraint_name INTO fk_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      WHERE tc.table_name = 'tasks'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'staffId'
      LIMIT 1;

      IF fk_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE tasks DROP CONSTRAINT %I', fk_name);
      END IF;
    END
    $$;
  `);

  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'tasks_staffid_staff_fkey'
      ) THEN
        ALTER TABLE tasks
          ADD CONSTRAINT tasks_staffid_staff_fkey
          FOREIGN KEY ("staffId") REFERENCES staff(id) ON DELETE SET NULL;
      END IF;
    END
    $$;
  `);
};

const seedRooms = async () => {
  const roomCount = await db.query('SELECT COUNT(*)::int AS count FROM rooms');
  if (roomCount.rows[0].count > 0) return;

  for (const room of roomSeeds) {
    await db.query(
      `INSERT INTO rooms 
       (number, title, type, price, status, capacity, bed_type, size_sqft, amenities, description, policies, image_urls, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11::jsonb, $12::jsonb, $13)`,
      [
        room.number || room.room_number,
        room.title,
        room.type,
        room.price,
        room.status || 'AVAILABLE',
        room.capacity || 2,
        room.bed_type,
        room.size_sqft,
        JSON.stringify(room.amenities || []),
        room.description,
        JSON.stringify(room.policies || []),
        JSON.stringify(room.image_urls || []),
        'Kathmandu, Nepal',
      ]
    );
  }
};

const seedMenu = async () => {
  const categoryCount = await db.query('SELECT COUNT(*)::int AS count FROM menu_categories');
  if (categoryCount.rows[0].count === 0) {
    for (let i = 0; i < menuCategories.length; i++) {
      await db.query('INSERT INTO menu_categories (name, sort_order) VALUES ($1, $2)', [menuCategories[i], i + 1]);
    }
  }

  const itemCount = await db.query('SELECT COUNT(*)::int AS count FROM menu_items');
  if (itemCount.rows[0].count > 0) return;

  for (const item of menuItemSeeds) {
    const category = await db.query('SELECT id FROM menu_categories WHERE name = $1', [item.category_name]);
    if (category.rows.length > 0) {
      await db.query(
        `INSERT INTO menu_items (category_id, name, description, price, image_url, is_veg, spice_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [category.rows[0].id, item.name, item.description, item.price, item.image_url, item.is_veg, item.spice_level]
      );
    }
  }
};

const initDatabase = async () => {
  try {
    await createTables();
    await seedRooms();
    await seedMenu();
    console.log('✅ Full PostgreSQL Database Bootstrap Complete');
  } catch (error) {
    console.error('❌ Failed to bootstrap database:', error);
  }
};

module.exports = { initDatabase };
