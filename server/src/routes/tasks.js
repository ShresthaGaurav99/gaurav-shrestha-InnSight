const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// Manager assigns task
router.post('/', [auth, authorize('manager')], async (req, res) => {
    const { title, description, staffId } = req.body;

    try {
        const result = await db.query(
            `INSERT INTO tasks (title, description, "staffId", status, "createdAt", "updatedAt") 
             VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`,
            [title, description, staffId, 'PENDING']
        );
        
        const taskId = result.rows[0].id;
        const task = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
        res.status(201).json(task.rows[0]);
    } catch (err) {
        console.error('Create task error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Staff views tasks
router.get('/assigned', [auth, authorize('staff')], async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM tasks WHERE "staffId" = $1 ORDER BY "createdAt" DESC',
            [req.user.userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Staff updates task status
router.patch('/:id/status', [auth, authorize('staff')], async (req, res) => {
    const { status } = req.body;
    try {
        const result = await db.query(
            'UPDATE tasks SET status = $1, "updatedAt" = NOW() WHERE id = $2 AND "staffId" = $3 RETURNING *',
            [status, req.params.id, req.user.userId]
        );
        
        if (result.rows.length === 0) return res.status(404).json({ message: 'Task not found or unauthorized' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Manager views all tasks summary
router.get('/summary', [auth, authorize('manager')], async (req, res) => {
    try {
        const result = await db.query('SELECT status, COUNT(*) as count FROM tasks GROUP BY status');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
