const db = require('../config/db');

// 1. GET /api/tasks → view tasks (role-based)
exports.getAllTasks = async (req, res) => {
  try {
    const query = `
      SELECT t.*, s.name as staff_name 
      FROM tasks t
      JOIN staff s ON t."staffId" = s.id
      ORDER BY t."createdAt" DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

// 1b. GET /api/tasks/staff/:id → view tasks for specific staff
exports.getStaffTasks = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM tasks WHERE "staffId" = $1 ORDER BY "createdAt" DESC', [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching staff tasks', error: err.message });
  }
};

// 2. POST /api/tasks → assign task
exports.assignTask = async (req, res) => {
  const { title, description, staffId } = req.body;

  try {
    // 1. Verify staff member exists
    const staffResult = await db.query('SELECT * FROM staff WHERE id = $1', [staffId]);
    if (staffResult.rows.length === 0) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // 2. Create the task
    const result = await db.query(
      'INSERT INTO tasks (title, description, status, "staffId", "updatedAt") VALUES ($1, $2, $3, $4, NOW()) RETURNING *',

      [title, description, 'PENDING', staffId]
    );

    res.status(201).json({ message: 'Task assigned successfully', task: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning task', error: error.message });
  }
};

// 3. PUT /api/tasks/:id → update task status
exports.updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await db.query(
      'UPDATE tasks SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',

      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task status updated', task: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};
