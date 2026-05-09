const db = require('../config/db');

exports.getAllStaff = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, "createdAt" FROM users WHERE role IN (\'staff\', \'manager\') ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  const { id } = req.params;
  try {
    const userResult = await db.query('DELETE FROM users WHERE id = $1 AND role IN (\'staff\', \'manager\') RETURNING email', [id]);
    if (userResult.rows.length > 0) {
      const email = userResult.rows[0].email;
      // Also delete from staff table if exists
      await db.query('DELETE FROM staff WHERE email = $1', [email]);
      res.json({ message: 'Staff removed successfully' });
    } else {
      res.status(404).json({ message: 'Staff not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

