const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// Create a booking
router.post('/', auth, async (req, res) => {
    const { roomId, checkIn, checkOut, totalAmount, guestName, guestEmail, phone } = req.body;
    const userId = req.user.id;

    try {
        const result = await db.query(
            `INSERT INTO bookings ("roomId", "checkIn", "checkOut", "totalAmount", "guestName", "guestEmail", "phone", status, "createdAt", "updatedAt") 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
            [roomId, checkIn, checkOut, totalAmount, guestName, guestEmail, phone, 'CONFIRMED']
        );
        
        const bookingId = result.rows[0].id;

        // Update room status
        await db.query('UPDATE rooms SET status = $1 WHERE id = $2', ['OCCUPIED', roomId]);

        // Fetch the inserted booking
        const fullBooking = await db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
        res.status(201).json(fullBooking.rows[0]);
    } catch (err) {
        console.error('Create booking error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get user bookings
router.get('/my', auth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT b.*, r.room_number, r.type 
             FROM bookings b 
             JOIN rooms r ON b."roomId" = r.id 
             WHERE b."guestEmail" = (SELECT email FROM users WHERE id = $1)
             ORDER BY b."createdAt" DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get ALL bookings (Manager only)
router.get('/all', [auth, authorize('manager')], async (req, res) => {
    try {
        const result = await db.query(
            `SELECT b.*, r.room_number, r.type 
             FROM bookings b 
             JOIN rooms r ON b."roomId" = r.id 
             ORDER BY b."createdAt" DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
