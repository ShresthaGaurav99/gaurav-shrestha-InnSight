const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// Get all available rooms (for customers)
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM rooms WHERE status = ?';
        db.db.all(query, ['available'], (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(rows);
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all rooms including occupied (for managers)
router.get('/all', [auth, authorize('manager')], async (req, res) => {
    try {
        db.db.all('SELECT * FROM rooms', [], (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(rows);
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get room by ID
router.get('/:id', async (req, res) => {
    try {
        const query = 'SELECT * FROM rooms WHERE id = ?';
        db.db.get(query, [req.params.id], (err, row) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!row) return res.status(404).json({ message: 'Room not found' });
            res.json(row);
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new room (Manager only)
router.post('/', [auth, authorize('manager')], async (req, res) => {
    const { roomNumber, type, price, capacity, description, imageUrl } = req.body;
    try {
        const query = 'INSERT INTO rooms (room_number, type, price, capacity, description, image_url) VALUES (?, ?, ?, ?, ?, ?)';
        db.db.run(query, [roomNumber, type, price, capacity, description, imageUrl], function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.status(201).json({ id: this.lastID, roomNumber, type, price });
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update room (Manager only)
router.put('/:id', [auth, authorize('manager')], async (req, res) => {
    const { status, price, type } = req.body;
    try {
        db.db.run('UPDATE rooms SET status = ?, price = ?, type = ? WHERE id = ?',
            [status, price, type, req.params.id], function (err) {
                if (err) return res.status(500).json({ message: err.message });
                res.json({ message: 'Room updated' });
            });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
