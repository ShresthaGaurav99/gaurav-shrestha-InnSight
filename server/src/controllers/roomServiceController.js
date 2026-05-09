const db = require('../config/db');

exports.getAllOrders = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        rs.*,
        mi.name AS menu_item_name,
        mi.image_url AS menu_item_image,
        b."guestName" AS booking_guest_name
      FROM room_service rs
      LEFT JOIN menu_items mi ON rs.menu_item_id = mi.id
      LEFT JOIN bookings b ON rs.booking_id = b.id
      ORDER BY rs.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        rs.*,
        mi.name AS menu_item_name,
        mi.image_url AS menu_item_image,
        b."guestName" AS booking_guest_name
      FROM room_service rs
      LEFT JOIN menu_items mi ON rs.menu_item_id = mi.id
      JOIN bookings b ON rs.booking_id = b.id
      WHERE b.user_id = $1
      ORDER BY rs.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  const { roomNumber, bookingId, menuItemId, quantity = 1, specialRequest, guestName } = req.body;
  try {
    const menuItemResult = await db.query('SELECT id, name, price FROM menu_items WHERE id = $1', [menuItemId]);
    if (menuItemResult.rows.length === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const menuItem = menuItemResult.rows[0];
    const safeQuantity = Math.max(1, parseInt(quantity, 10) || 1);
    const totalAmount = parseFloat(menuItem.price) * safeQuantity;

    const result = await db.query(
      `INSERT INTO room_service
       (room_number, booking_id, menu_item_id, item, price, quantity, total_amount, status, special_request, guest_name, payment_status, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       RETURNING *`,
      [
        roomNumber,
        bookingId || null,
        menuItem.id,
        menuItem.name,
        parseFloat(menuItem.price),
        safeQuantity,
        totalAmount,
        'PENDING',
        specialRequest || null,
        guestName || null,
        'PENDING',
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await db.query(
        'UPDATE room_service SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, id]
    );
    
    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order status updated', order: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

