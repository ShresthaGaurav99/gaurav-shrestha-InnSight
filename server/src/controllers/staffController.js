const db = require('../config/db');

exports.getAllStaff = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM staff ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addStaff = async (req, res) => {
  const { name, email, position } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO staff (name, email, position, "updatedAt") VALUES ($1, $2, $3, NOW()) RETURNING *',
      [name, email, position]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

