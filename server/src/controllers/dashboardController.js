const db = require('../config/db');

exports.getAnalytics = async (req, res) => {
  try {
    // 1. Room Statistics
    const roomsQuery = `
      SELECT 
        COUNT(*) as "totalRooms",
        COUNT(*) FILTER (WHERE status = 'OCCUPIED' OR status = 'occupied') as "bookedRooms",
        COUNT(*) FILTER (WHERE status = 'AVAILABLE' OR status = 'available') as "availableRooms",
        COUNT(*) FILTER (WHERE status = 'MAINTENANCE' OR status = 'maintenance') as "maintenanceRooms"
      FROM rooms
    `;
    
    // 2. Revenue (Assuming totalAmount in bookings)
    const revenueQuery = `SELECT SUM("totalAmount") as "totalRevenue" FROM bookings WHERE status != 'CANCELLED'`;
    
    // 3. Room Service Status
    const rsQuery = `SELECT COUNT(*) as "pendingOrders" FROM room_service WHERE status != 'DELIVERED'`;
    
    // 4. Inventory Alerts
    const invQuery = `SELECT COUNT(*) as "lowStock" FROM "Inventory" WHERE status = 'LOW_STOCK' OR status = 'OUT_OF_STOCK'`;
    
    // 5. Staff count
    const staffQuery = `SELECT COUNT(*) as "totalStaff" FROM staff`;
    
    // 6. Today's Attendance
    const attQuery = `SELECT COUNT(*) as "presentToday" FROM attendance WHERE date = CURRENT_DATE`;

    const [roomsRes, revRes, rsRes, invRes, staffRes, attRes] = await Promise.all([
      db.query(roomsQuery),
      db.query(revenueQuery),
      db.query(rsQuery),
      db.query(invQuery),
      db.query(staffQuery),
      db.query(attQuery)
    ]);

    res.json({
      ...roomsRes.rows[0],
      totalRevenue: parseFloat(revRes.rows[0].totalRevenue || 0),
      pendingRoomService: parseInt(rsRes.rows[0].pendingOrders || 0),
      lowStockItems: parseInt(invRes.rows[0].lowStock || 0),
      totalStaff: parseInt(staffRes.rows[0].totalStaff || 0),
      presentStaff: parseInt(attRes.rows[0].presentToday || 0)
    });
  } catch (error) {
    console.error('Dashboard Analytics Error:', error);
    res.status(500).json({ error: error.message });
  }
};
