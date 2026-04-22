const db = require('../config/db');

const otpStore = new Map();
const supportedGateways = ['ESEWA', 'KHALTI', 'CASH'];

const buildGatewayPayload = (gateway, amount, bookingId) => {
  if (gateway === 'ESEWA') {
    return {
      provider: 'eSewa',
      amount,
      bookingId,
      merchantCode: process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST',
      callbackUrl: process.env.ESEWA_CALLBACK_URL || 'https://example.com/esewa/callback',
      liveMode: false,
    };
  }

  if (gateway === 'KHALTI') {
    return {
      provider: 'Khalti',
      amount,
      bookingId,
      publicKey: process.env.KHALTI_PUBLIC_KEY,
      callbackUrl: process.env.KHALTI_CALLBACK_URL || 'https://example.com/khalti/callback',
      liveMode: process.env.KHALTI_ENV === 'prod',
    };
  }

  return {
    provider: 'Cash',
    amount,
    bookingId,
    note: 'Collect payment at front desk',
  };
};

exports.initiatePayment = async (req, res) => {
  const { bookingId, amount, method } = req.body;
  const userId = req.user.userId;

  try {
    const gateway = String(method || 'CASH').toUpperCase();
    if (!supportedGateways.includes(gateway)) {
      return res.status(400).json({ message: 'Unsupported payment gateway' });
    }

    const bookingResult = await db.query('SELECT id, "totalAmount", "paymentStatus" FROM bookings WHERE id = $1', [bookingId]);
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const transactionId = 'TXN-' + Date.now() + Math.floor(Math.random() * 1000);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resolvedAmount = parseFloat(amount || bookingResult.rows[0].totalAmount || 0);
    const providerPayload = buildGatewayPayload(gateway, resolvedAmount, bookingId);

    otpStore.set(transactionId, {
      otp,
      userId,
      bookingId,
      amount: resolvedAmount,
      method: gateway,
      providerPayload,
      expires: Date.now() + 5 * 60 * 1000
    });

    await db.query(
      'UPDATE bookings SET "paymentStatus" = $1, "updatedAt" = NOW() WHERE id = $2',
      ['PROCESSING', bookingId]
    );

    res.json({
      message: gateway === 'CASH' ? 'Cash payment request created for front desk collection' : 'OTP sent to your mobile',
      transactionId,
      mockOtp: otp,
      gateway,
      providerPayload,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error initiating payment', error: error.message });
  }
};

exports.confirmPayment = async (req, res) => {
  const { transactionId, otp } = req.body;

  try {
    const data = otpStore.get(transactionId);

    if (!data) {
      return res.status(404).json({ message: 'Transaction not found or expired' });
    }

    if (data.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (Date.now() > data.expires) {
      otpStore.delete(transactionId);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const status = data.method === 'CASH' ? 'PENDING_SETTLEMENT' : 'SUCCESS';
    const bookingPaymentStatus = data.method === 'CASH' ? 'PENDING_SETTLEMENT' : 'PAID';
    const bookingStatus = data.method === 'CASH' ? 'CONFIRMED' : 'CONFIRMED';

    const query = `
      INSERT INTO payments (user_id, booking_id, amount, method, status, transaction_id, gateway, reference_type, reference_id, provider_payload)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
      RETURNING *
    `;
    const result = await db.query(query, [
      data.userId,
      data.bookingId,
      data.amount,
      data.method,
      status,
      transactionId,
      data.method,
      'BOOKING',
      data.bookingId,
      JSON.stringify(data.providerPayload)
    ]);

    await db.query(
      'UPDATE bookings SET status = $1, "paymentStatus" = $2, "updatedAt" = NOW() WHERE id = $3',
      [bookingStatus, bookingPaymentStatus, data.bookingId]
    );

    otpStore.delete(transactionId);

    res.status(201).json({
      message: data.method === 'CASH' ? 'Cash payment marked for front desk settlement' : 'Payment verified and successful',
      payment: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({ message: 'Error confirming payment', error: error.message });
  }
};

exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await db.query('SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};
