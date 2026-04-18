const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/tasks → view tasks
router.get('/', authMiddleware, taskController.getAllTasks);

// GET /api/tasks/staff/:id → view tasks for staff
router.get('/staff/:id', authMiddleware, taskController.getStaffTasks);

// POST /api/tasks → assign task
router.post('/', authMiddleware, taskController.assignTask);

// PUT /api/tasks/:id → update task status
router.put('/:id', authMiddleware, taskController.updateTaskStatus);

module.exports = router;
