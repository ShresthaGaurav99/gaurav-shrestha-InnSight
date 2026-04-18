const db = require('../config/db');

exports.getAnalytics = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as "totalRooms",
        COUNT(*) FILTER (WHERE status = 'occupied') as "bookedRooms",
        COUNT(*) FILTER (WHERE status = 'available') as "availableRooms",
        COUNT(*) FILTER (WHERE status = 'maintenance') as "maintenanceRooms"
      FROM rooms
    `;
    const result = await db.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
