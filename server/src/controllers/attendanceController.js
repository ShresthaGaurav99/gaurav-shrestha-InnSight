const db = require('../config/db');

// Helper to get or create staff record from email
async function getOrCreateStaff(email, name) {
  let result = await db.query('SELECT id FROM staff WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    result = await db.query(
      'INSERT INTO staff (name, email, position, "updatedAt") VALUES ($1, $2, $3, NOW()) RETURNING id',
      [name || email.split('@')[0], email, 'Staff']
    );
  }
  return result.rows[0].id;
}

// Check-in (Mark attendance for today)
exports.checkIn = async (req, res) => {
  const { email, name } = req.body;
  try {
    const staffId = await getOrCreateStaff(email, name);
    const result = await db.query(
      'INSERT INTO attendance (staff_id, status) VALUES ($1, \'PRESENT\') ON CONFLICT (staff_id, date) DO UPDATE SET check_in = CURRENT_TIMESTAMP RETURNING *',
      [staffId]
    );
    res.json({ message: 'Checked in successfully', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check-out (Finish shift)
exports.checkOut = async (req, res) => {
  const { email, name } = req.body;
  try {
    const staffId = await getOrCreateStaff(email, name);
    const result = await db.query(
      'UPDATE attendance SET check_out = CURRENT_TIMESTAMP WHERE staff_id = $1 AND date = CURRENT_DATE RETURNING *',
      [staffId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No check-in record found for today' });
    }
    res.json({ message: 'Checked out successfully', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get today's attendance roster
exports.getTodayRoster = async (req, res) => {
  try {
    const query = `
      SELECT a.*, s.name, s.position 
      FROM attendance a 
      JOIN staff s ON a.staff_id = s.id 
      WHERE a.date = CURRENT_DATE
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get attendance history for a staff member by email
exports.getHistory = async (req, res) => {
  const { email } = req.params;
  try {
    const staffResult = await db.query('SELECT id FROM staff WHERE email = $1', [email]);
    if (staffResult.rows.length === 0) return res.json([]);
    const staffId = staffResult.rows[0].id;

    const result = await db.query(
      'SELECT * FROM attendance WHERE staff_id = $1 ORDER BY date DESC',
      [staffId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
