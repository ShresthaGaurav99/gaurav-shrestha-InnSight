const db = require('../config/db');

const VAT_RATE = 0.13;

const bookingSelect = `
  SELECT
    b.*,
    r.number AS room_number,
    r.title AS room_title,
    r.type AS room_type,
    r.price AS room_price,
    r.image_urls AS room_images
  FROM bookings b
  JOIN rooms r ON b."roomId" = r.id
`;

exports.getAllBookings = async (req, res) => {
  try {
    const result = await db.query(`${bookingSelect} ORDER BY b."createdAt" DESC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

exports.createBooking = async (req, res) => {
  const {
    guestName,
    guestEmail,
    phone,
    checkIn,
    checkOut,
    roomId,
    guestCount = 1,
  } = req.body;

  try {
    await db.query('BEGIN');

    const roomResult = await db.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
    if (roomResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Room not found' });
    }
    const room = roomResult.rows[0];

    const overlapQuery = `
      SELECT id FROM bookings 
      WHERE "roomId" = $1 
      AND status NOT IN ('CANCELLED', 'COMPLETED')
      AND ("checkIn", "checkOut") OVERLAPS ($2, $3)
    `;
    const overlapResult = await db.query(overlapQuery, [roomId, checkIn, checkOut]);
    
    if (overlapResult.rows.length > 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({ message: 'Room is already booked for these dates' });
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    const roomRate = parseFloat(room.price);
    const totalBeforeVat = roomRate * nights;
    const vatAmount = parseFloat((totalBeforeVat * VAT_RATE).toFixed(2));
    const totalAmount = parseFloat((totalBeforeVat + vatAmount).toFixed(2));

    const bookingResult = await db.query(
      `INSERT INTO bookings
       ("guestName", "guestEmail", phone, "checkIn", "checkOut", "roomId", status, nights, "guestCount", "roomRate", "vatAmount", "totalAmount", "paymentStatus", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
       RETURNING *`,
      [
        guestName,
        guestEmail,
        phone || null,
        startDate,
        endDate,
        roomId,
        'PENDING',
        nights,
        guestCount,
        roomRate,
        vatAmount,
        totalAmount,
        'PENDING',
      ]
    );

    await db.query('COMMIT');

    res.status(201).json({
      message: 'Booking created successfully',
      booking: bookingResult.rows[0],
    });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('BEGIN');
    
    const bookingResult = await db.query('SELECT "roomId" FROM bookings WHERE id = $1', [id]);
    const booking = bookingResult.rows[0];

    if (!booking) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Booking not found' });
    }

    await db.query('UPDATE bookings SET status = $1, "paymentStatus" = $2, "updatedAt" = NOW() WHERE id = $3', ['CANCELLED', 'VOID', id]);
    await db.query('UPDATE rooms SET status = $1, "updatedAt" = NOW() WHERE id = $2', ['AVAILABLE', booking.roomId]);

    await db.query('COMMIT');
    res.json({ message: 'Booking cancelled and room is now available' });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }
};

exports.getCustomerBookings = async (req, res) => {
  const { email } = req.params;
  try {
    const result = await db.query(`${bookingSelect} WHERE b."guestEmail" = $1 ORDER BY b."createdAt" DESC`, [email]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userResult = await db.query('SELECT email FROM users WHERE id = $1', [req.user.userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const userEmail = userResult.rows[0].email;
    
    const result = await db.query(`${bookingSelect} WHERE b."guestEmail" = $1 ORDER BY b."createdAt" DESC`, [userEmail]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your bookings', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const normalizedStatus = status.toUpperCase();
        const result = await db.query(
            'UPDATE bookings SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
            [normalizedStatus, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (normalizedStatus === 'CHECKED_IN') {
            const booking = result.rows[0];
            await db.query('UPDATE rooms SET status = $1, "updatedAt" = NOW() WHERE id = $2', ['OCCUPIED', booking.roomId]);
        }

        if (normalizedStatus === 'COMPLETED' || normalizedStatus === 'CANCELLED') {
            const booking = result.rows[0];
            await db.query('UPDATE rooms SET status = $1, "updatedAt" = NOW() WHERE id = $2', ['AVAILABLE', booking.roomId]);
        }
        
        res.json({ message: 'Status updated', booking: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: 'Update failed', error: err.message });
    }
};

