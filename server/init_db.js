const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'inn_sight.db');
const db = new sqlite3.Database(dbPath);

const schema = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('customer', 'staff', 'manager')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL,
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'occupied', 'maintenance')),
    image_url TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    room_id INTEGER,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(room_id) REFERENCES rooms(id)
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to INTEGER,
    assigned_by INTEGER,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in-progress', 'completed')),
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(assigned_to) REFERENCES users(id),
    FOREIGN KEY(assigned_by) REFERENCES users(id)
);

-- Seed Data
INSERT OR IGNORE INTO rooms (room_number, type, price, capacity) VALUES 
('101', 'Single', 50.00, 1),
('102', 'Double', 80.00, 2),
('201', 'Suite', 150.00, 4);
`;

db.exec(schema, (err) => {
    if (err) {
        console.error('Error initializing database:', err.message);
    } else {
        console.log('Database initialized successfully.');
    }
    db.close();
});
