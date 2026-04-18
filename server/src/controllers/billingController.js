const db = require('../config/db');

// 1. GET /api/billing → fetch all payments/invoices
exports.getAllInvoices = async (req, res) => {
  try {
    // Join payments with bookings to get guest name context
    const query = `
      SELECT p.*, b."guestName", b."guestEmail"
      FROM payments p
      LEFT JOIN bookings b ON p."booking_id" = b.id
      ORDER BY p.created_at DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. POST /api/billing → create new payment (invoice)
exports.createInvoice = async (req, res) => {
  const { bookingId, amount, method } = req.body;
  try {
    // Note: guestName is not in payments table, it's in bookings.
    // We link by booking_id.
    const result = await db.query(
      'INSERT INTO payments (booking_id, amount, method, status, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [bookingId, parseFloat(amount), method || 'CASH', 'UNPAID']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. PUT /api/billing/:id/pay → mark as paid
exports.markAsPaid = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'UPDATE payments SET status = $1 WHERE id = $2 RETURNING *',
      ['PAID', id]
    );
    
    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json({ message: 'Invoice marked as paid', invoice: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

