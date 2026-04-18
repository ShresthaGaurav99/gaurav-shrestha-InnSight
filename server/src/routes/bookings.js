const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// Create a booking
router.post('/', auth, async (req, res) => {
    const { roomId, checkIn, checkOut, totalPrice } = req.body;
    const userId = req.user.id;

    try {
        const query = `
      INSERT INTO bookings (user_id, room_id, check_in, check_out, total_price, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        const params = [userId, roomId, checkIn, checkOut, totalPrice, 'confirmed'];

        db.db.run(query, params, function (err) {
            if (err) return res.status(500).json({ message: err.message });
            const bookingId = this.lastID; // Wait, for UUIDs this won't work as expected if we use UUID in SQL.
            // SQLite uses integer ROWID by default unless we use text primary keys.
            // We will stick to INTEGER PRIMARY KEY AUTOINCREMENT for simplicity in SQLite mode.

            // Update room status
            db.db.run('UPDATE rooms SET status = ? WHERE id = ?', ['occupied', roomId]);

            // Fetch the inserted booking
            db.db.get('SELECT * FROM bookings WHERE id = ?', [bookingId], (err2, row) => {
                if (err2) return res.status(500).json({ message: 'Error fetching created booking' });
                res.status(201).json(row);
            });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user bookings
router.get('/my', auth, async (req, res) => {
    try {
        const query = `
      SELECT b.*, r.room_number, r.type 
      FROM bookings b 
      JOIN rooms r ON b.room_id = r.id 
      WHERE b.user_id = ? 
      ORDER BY b.created_at DESC
    `;
        db.db.all(query, [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(rows);
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get ALL bookings (Manager only)
router.get('/all', [auth, authorize('manager')], async (req, res) => {
    try {
        const query = `
      SELECT b.*, r.room_number, r.type, u.full_name as customerName 
      FROM bookings b 
      JOIN rooms r ON b.room_id = r.id 
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `;
        db.db.all(query, [], (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(rows);
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
