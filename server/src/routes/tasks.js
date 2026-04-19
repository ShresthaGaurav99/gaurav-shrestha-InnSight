const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// Manager assigns task
router.post('/', [auth, authorize('manager')], async (req, res) => {
    const { title, description, assignedTo, dueDate } = req.body;
    const assignedBy = req.user.id;

    try {
        const query = `INSERT INTO tasks (title, description, assigned_to, assigned_by, due_date) VALUES (?, ?, ?, ?, ?)`;
        const params = [title, description, assignedTo, assignedBy, dueDate];

        // Using run() via the wrapper or raw db instance
        db.db.run(query, params, function (err) {
            if (err) {
                return res.status(500).json({ message: 'Server error: ' + err.message });
            }
            // Fetch the inserted task
            db.db.get(`SELECT * FROM tasks WHERE id = ?`, [this.lastID], (err2, row) => {
                if (err2) return res.status(500).json({ message: 'Server error' });
                res.status(201).json(row);
            });
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Staff views tasks
router.get('/assigned', [auth, authorize('staff')], async (req, res) => {
    try {
        // SQLite uses ? instead of $1
        const query = 'SELECT * FROM tasks WHERE assigned_to = ? ORDER BY created_at DESC';
        db.db.all(query, [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(rows);
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Staff updates task status
router.patch('/:id/status', [auth, authorize('staff')], async (req, res) => {
    const { status } = req.body;
    try {
        const query = 'UPDATE tasks SET status = ? WHERE id = ? AND assigned_to = ?';
        db.db.run(query, [status, req.params.id, req.user.id], function (err) {
            if (err) return res.status(500).json({ message: err.message });

            db.db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err2, row) => {
                if (err2) return res.status(500).json({ message: 'Server error' });
                res.json(row);
            });
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Manager views all tasks summary
router.get('/summary', [auth, authorize('manager')], async (req, res) => {
    try {
        db.db.all('SELECT status, COUNT(*) as count FROM tasks GROUP BY status', [], (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(rows);
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
