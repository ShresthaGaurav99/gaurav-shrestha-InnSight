const crypto = require('crypto');
const db = require('../config/db');

const pendingStore = new Map();

const getBaseUrl = (req) => {
  const configured = process.env.PUBLIC_BASE_URL;
  if (configured) return configured.replace(/\/+$/, '');
  return `${req.protocol}://${req.get('host')}`;
};

const ensureBooking = async (bookingId) => {
  const bookingResult = await db.query(
    'SELECT id, "totalAmount", "paymentStatus", status FROM bookings WHERE id = $1',
    [bookingId]
  );
  if (bookingResult.rows.length === 0) return null;
  return bookingResult.rows[0];
};

const createPaymentRecord = async ({
  userId,
  bookingId,
  amount,
  gateway,
  status,
  transactionId,
  providerPayload,
}) => {
  const query = `
    INSERT INTO payments (user_id, booking_id, amount, method, status, transaction_id, gateway, reference_type, reference_id, provider_payload)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'BOOKING', $2, $8::jsonb)
    RETURNING *
  `;
  const result = await db.query(query, [
    userId,
    bookingId,
    amount,
    gateway,
    status,
    transactionId,
    gateway,
    JSON.stringify(providerPayload || {}),
  ]);
  return result.rows[0];
};

const markBookingPaid = async (bookingId, paymentStatus) => {
  await db.query(
    'UPDATE bookings SET "paymentStatus" = $1, status = $2, "updatedAt" = NOW() WHERE id = $3',
    [paymentStatus, 'CONFIRMED', bookingId]
  );
};

// -----------------------
// eSewa ePay v2
// -----------------------

const getEsewaConfig = (req) => {
  const isProd = String(process.env.ESEWA_ENV || 'uat').toLowerCase() === 'prod';
  return {
    formUrl: isProd
      ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
      : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
    statusUrl: isProd
      ? 'https://epay.esewa.com.np/api/epay/transaction/status/'
      : 'https://uat.esewa.com.np/api/epay/transaction/status/',
    productCode: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
    secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
    baseUrl: getBaseUrl(req),
  };
};

const hmacBase64 = (message, secret) =>
  crypto.createHmac('sha256', secret).update(message).digest('base64');

exports.esewaInitiate = async (req, res) => {
  const { bookingId } = req.body;
  const userId = req.user.userId;

  try {
    const booking = await ensureBooking(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const config = getEsewaConfig(req);
    const transactionUuid = `BOOK-${bookingId}`;
    const totalAmount = Number(booking.totalAmount || 0);
    const taxAmount = Number((totalAmount * 0.13) / 1.13).toFixed(2);
    const amount = Number(totalAmount - Number(taxAmount)).toFixed(2);

    const signedFieldNames = 'total_amount,transaction_uuid,product_code';
    const signatureMessage = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${config.productCode}`;
    const signature = hmacBase64(signatureMessage, config.secretKey);

    const successUrl = `${config.baseUrl}/api/payments/esewa/return/success`;
    const failureUrl = `${config.baseUrl}/api/payments/esewa/return/failure`;

    pendingStore.set(transactionUuid, {
      gateway: 'ESEWA',
      bookingId,
      userId,
      totalAmount,
      createdAt: Date.now(),
    });

    await db.query(
      'UPDATE bookings SET "paymentStatus" = $1, "updatedAt" = NOW() WHERE id = $2',
      ['PROCESSING', bookingId]
    );

    return res.json({
      gateway: 'ESEWA',
      transactionUuid,
      formUrl: `${config.baseUrl}/api/payments/esewa/form/${encodeURIComponent(transactionUuid)}`,
      debug: {
        testEsewaId: '9806800001',
        testPassword: 'Nepal@123',
        testOtpToken: '123456',
      },
      form: {
        action: config.formUrl,
        amount,
        tax_amount: taxAmount,
        total_amount: String(totalAmount),
        transaction_uuid: transactionUuid,
        product_code: config.productCode,
        product_service_charge: '0',
        product_delivery_charge: '0',
        success_url: successUrl,
        failure_url: failureUrl,
        signed_field_names: signedFieldNames,
        signature,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to initiate eSewa payment', error: error.message });
  }
};

exports.esewaForm = async (req, res) => {
  const { transactionUuid } = req.params;
  const pending = pendingStore.get(transactionUuid);
  if (!pending) return res.status(404).send('Payment session not found');

  const config = getEsewaConfig(req);
  const totalAmount = pending.totalAmount;
  const taxAmount = Number((totalAmount * 0.13) / 1.13).toFixed(2);
  const amount = Number(totalAmount - Number(taxAmount)).toFixed(2);

  const signedFieldNames = 'total_amount,transaction_uuid,product_code';
  const signatureMessage = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${config.productCode}`;
  const signature = hmacBase64(signatureMessage, config.secretKey);

  const successUrl = `${config.baseUrl}/api/payments/esewa/return/success`;
  const failureUrl = `${config.baseUrl}/api/payments/esewa/return/failure`;

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!doctype html>
<html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
  <body>
    <p>Redirecting to eSewa…</p>
    <form id="esewa" action="${config.formUrl}" method="POST">
      <input type="hidden" name="amount" value="${amount}" />
      <input type="hidden" name="tax_amount" value="${taxAmount}" />
      <input type="hidden" name="total_amount" value="${totalAmount}" />
      <input type="hidden" name="transaction_uuid" value="${transactionUuid}" />
      <input type="hidden" name="product_code" value="${config.productCode}" />
      <input type="hidden" name="product_service_charge" value="0" />
      <input type="hidden" name="product_delivery_charge" value="0" />
      <input type="hidden" name="success_url" value="${successUrl}" />
      <input type="hidden" name="failure_url" value="${failureUrl}" />
      <input type="hidden" name="signed_field_names" value="${signedFieldNames}" />
      <input type="hidden" name="signature" value="${signature}" />
    </form>
    <script>document.getElementById('esewa').submit();</script>
  </body>
</html>`);
};

const decodeEsewaData = (data) => {
  try {
    const decoded = Buffer.from(String(data || ''), 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

exports.esewaReturn = async (req, res) => {
  const result = decodeEsewaData(req.query.data || req.body?.data);
  const isSuccess = req.params.outcome === 'success';

  const transactionUuid = result?.transaction_uuid;
  const pending = transactionUuid ? pendingStore.get(transactionUuid) : null;

  const redirectBase = 'innsight://payment-result';
  if (!pending) {
    return res.redirect(`${redirectBase}?gateway=ESEWA&status=UNKNOWN`);
  }

  // Do server-side status check (recommended by eSewa)
  try {
    const config = getEsewaConfig(req);
    const statusUrl = `${config.statusUrl}?product_code=${encodeURIComponent(config.productCode)}&total_amount=${encodeURIComponent(
      pending.totalAmount
    )}&transaction_uuid=${encodeURIComponent(transactionUuid)}`;
    const statusRes = await fetch(statusUrl);
    const statusJson = await statusRes.json().catch(() => null);

    const status = statusJson?.status || (isSuccess ? 'COMPLETE' : 'FAILED');

    if (String(status).toUpperCase() === 'COMPLETE') {
      const payment = await createPaymentRecord({
        userId: pending.userId,
        bookingId: pending.bookingId,
        amount: pending.totalAmount,
        gateway: 'ESEWA',
        status: 'SUCCESS',
        transactionId: result?.transaction_code || transactionUuid,
        providerPayload: { esewa: result, status: statusJson },
      });

      await markBookingPaid(pending.bookingId, 'PAID');
      pendingStore.delete(transactionUuid);
      return res.redirect(`${redirectBase}?gateway=ESEWA&status=SUCCESS&bookingId=${pending.bookingId}&paymentId=${payment.id}`);
    }

    pendingStore.delete(transactionUuid);
    await db.query('UPDATE bookings SET "paymentStatus" = $1 WHERE id = $2', ['FAILED', pending.bookingId]);
    return res.redirect(`${redirectBase}?gateway=ESEWA&status=FAILED&bookingId=${pending.bookingId}`);
  } catch (error) {
    return res.redirect(`${redirectBase}?gateway=ESEWA&status=ERROR`);
  }
};

// -----------------------
// Khalti KPG-2 (ePayment)
// -----------------------

const getKhaltiConfig = (req) => {
  const isProd = String(process.env.KHALTI_ENV || 'sandbox').toLowerCase() === 'prod';
  return {
    baseApi: isProd ? 'https://khalti.com/api/v2' : 'https://dev.khalti.com/api/v2',
    secretKey: process.env.KHALTI_SECRET_KEY || '',
    websiteUrl: process.env.KHALTI_WEBSITE_URL || getBaseUrl(req),
    baseUrl: getBaseUrl(req),
  };
};

exports.khaltiInitiate = async (req, res) => {
  const { bookingId } = req.body;
  const userId = req.user.userId;

  try {
    const booking = await ensureBooking(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const config = getKhaltiConfig(req);
    if (!config.secretKey) {
      return res.status(400).json({ message: 'Khalti secret key is not configured on server' });
    }

    const amountPaisa = Math.round(Number(booking.totalAmount || 0) * 100);
    const returnUrl = `${config.baseUrl}/api/payments/khalti/return`;
    const purchaseOrderId = `BOOK-${bookingId}`;

    const payload = {
      return_url: returnUrl,
      website_url: config.websiteUrl,
      amount: amountPaisa,
      purchase_order_id: purchaseOrderId,
      purchase_order_name: 'InnSight Room Booking',
      customer_info: {
        name: req.user?.name || 'InnSight Guest',
        email: req.user?.email || 'guest@innsight.com',
        phone: req.body.phone || '9800000001',
      },
    };

    const response = await fetch(`${config.baseApi}/epayment/initiate/`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (!response.ok) {
      return res.status(400).json({ message: 'Khalti initiate failed', details: json });
    }

    pendingStore.set(json.pidx, {
      gateway: 'KHALTI',
      bookingId,
      userId,
      amountPaisa,
      createdAt: Date.now(),
    });

    await db.query(
      'UPDATE bookings SET "paymentStatus" = $1, "updatedAt" = NOW() WHERE id = $2',
      ['PROCESSING', bookingId]
    );

    return res.json({
      gateway: 'KHALTI',
      pidx: json.pidx,
      paymentUrl: json.payment_url,
      debug: {
        testKhaltiIds: ['9800000000', '9800000001', '9800000002', '9800000003', '9800000004', '9800000005'],
        testOtp: '987654',
        testMpin: '1111',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to initiate Khalti payment', error: error.message });
  }
};

exports.khaltiReturn = async (req, res) => {
  const { pidx, status, purchase_order_id } = req.query;
  const pending = pidx ? pendingStore.get(pidx) : null;
  const redirectBase = 'innsight://payment-result';

  if (!pending) {
    return res.redirect(`${redirectBase}?gateway=KHALTI&status=UNKNOWN`);
  }

  // Always do lookup for final confirmation
  try {
    const config = getKhaltiConfig(req);
    const lookupRes = await fetch(`${config.baseApi}/epayment/lookup/`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pidx }),
    });
    const lookupJson = await lookupRes.json();
    const finalStatus = lookupJson?.status;

    if (String(finalStatus).toLowerCase() === 'completed') {
      const payment = await createPaymentRecord({
        userId: pending.userId,
        bookingId: pending.bookingId,
        amount: pending.amountPaisa / 100,
        gateway: 'KHALTI',
        status: 'SUCCESS',
        transactionId: lookupJson.transaction_id || pidx,
        providerPayload: { callback: req.query, lookup: lookupJson, purchase_order_id },
      });

      await markBookingPaid(pending.bookingId, 'PAID');
      pendingStore.delete(pidx);
      return res.redirect(`${redirectBase}?gateway=KHALTI&status=SUCCESS&bookingId=${pending.bookingId}&paymentId=${payment.id}`);
    }

    pendingStore.delete(pidx);
    await db.query('UPDATE bookings SET "paymentStatus" = $1 WHERE id = $2', ['FAILED', pending.bookingId]);
    return res.redirect(`${redirectBase}?gateway=KHALTI&status=FAILED&bookingId=${pending.bookingId}&rawStatus=${encodeURIComponent(String(status || finalStatus || ''))}`);
  } catch (error) {
    return res.redirect(`${redirectBase}?gateway=KHALTI&status=ERROR`);
  }
};

