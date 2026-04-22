const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// Get all available rooms (for customers)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM rooms WHERE status = $1', ['available']);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get all rooms including occupied (for managers)
router.get('/all', [auth, authorize('manager')], async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM rooms ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get room by ID
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM rooms WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Add new room (Manager only)
router.post('/', [auth, authorize('manager')], async (req, res) => {
    const { roomNumber, type, price, capacity, description, imageUrl } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO rooms (room_number, type, price, capacity, description, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [roomNumber, type, price, capacity, description, imageUrl]
        );
        res.status(201).json({ id: result.rows[0].id, roomNumber, type, price });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update room (Manager only)
router.put('/:id', [auth, authorize('manager')], async (req, res) => {
    const { status, price, type } = req.body;
    try {
        await db.query(
            'UPDATE rooms SET status = $1, price = $2, type = $3 WHERE id = $4',
            [status, price, type, req.params.id]
        );
        res.json({ message: 'Room updated' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
