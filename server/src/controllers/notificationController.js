const db = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM notifications ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('UPDATE notifications SET status = $1 WHERE id = $2 RETURNING *', ['READ', id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Marked as read', notification: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

