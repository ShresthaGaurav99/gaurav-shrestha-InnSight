const db = require('../config/db');

// Map DB status to UI status
const mapStatusToUI = (status) => {
  switch (status.toLowerCase()) {
    case 'available': return 'CLEAN';
    case 'occupied': return 'DIRTY';
    case 'maintenance': return 'DIRTY';
    case 'cleaning': return 'CLEANING';
    default: return 'DIRTY';
  }
};

exports.getHousekeeping = async (req, res) => {
  try {
    const result = await db.query('SELECT id, number as "roomNumber", status FROM rooms ORDER BY number ASC');
    const records = result.rows.map(r => ({
      id: r.id,
      roomNumber: r.roomNumber,
      status: mapStatusToUI(r.status),
      assignedTo: 'Unassigned' // Staff assignment can be added to DB later
    }));
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateHousekeepingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // Map UI status back to DB status
  let dbStatus = 'maintenance';
  if (status === 'CLEAN') dbStatus = 'available';
  if (status === 'CLEANING') dbStatus = 'cleaning';
  
  try {
    await db.query('UPDATE rooms SET status = $1, "updatedAt" = NOW() WHERE id = $2', [dbStatus, id]);
    res.json({ message: 'Housekeeping status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

