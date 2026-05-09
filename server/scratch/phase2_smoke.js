const jwt = require('jsonwebtoken');
const db = require('../src/config/db');
const { randomUUID } = require('crypto');

const baseUrl = 'http://127.0.0.1:5000';
const selectedSuite = (process.argv[2] || 'all').toLowerCase();
const allowedSuites = new Set(['all', 'core', 'billing', 'ops']);

if (!allowedSuites.has(selectedSuite)) {
  console.error(`Invalid suite "${selectedSuite}". Use one of: all, core, billing, ops.`);
  process.exit(1);
}

const inSuite = (...suites) => selectedSuite === 'all' || suites.includes(selectedSuite);
const uniqueSuffix = () => randomUUID().replace(/-/g, '').slice(0, 10);

const created = {
  roomId: null,
  disposableRoomId: null,
  bookingId: null,
  menuItemId: null,
  roomServiceId: null,
  invoiceId: null,
  inventoryId: null,
  notificationId: null,
  staffId: null,
  taskId: null,
  userId: null,
};

const report = [];
const runStep = async (name, fn) => {
  const startedAt = Date.now();
  try {
    const result = await fn();
    report.push({ name, status: 'PASS', durationMs: Date.now() - startedAt });
    return result;
  } catch (error) {
    report.push({ name, status: 'FAIL', durationMs: Date.now() - startedAt, error: error.message });
    throw error;
  }
};

const printReport = () => {
  const passed = report.filter((r) => r.status === 'PASS').length;
  const failed = report.filter((r) => r.status === 'FAIL').length;
  const totalDuration = report.reduce((acc, r) => acc + r.durationMs, 0);

  console.log(`\n--- API Smoke Report (${selectedSuite}) ---`);
  for (const entry of report) {
    const status = entry.status.padEnd(4, ' ');
    console.log(`[${status}] ${entry.name} (${entry.durationMs}ms)`);
    if (entry.error) {
      console.log(`       ${entry.error}`);
    }
  }
  console.log('------------------------');
  console.log(`Result: ${passed} passed, ${failed} failed, total ${report.length} checks (${totalDuration}ms)\n`);
};

const callApi = async (method, path, token, body) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(`${method} ${path} failed (${response.status}): ${JSON.stringify(payload)}`);
  }

  return payload;
};

const createToken = (userId, role = 'manager') =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

const run = async () => {
  try {
    // Seed identity for authenticated routes.
    const seededUser = await runStep('seed manager user', () => db.query(
      `INSERT INTO users (name, email, password, role, "updatedAt")
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id`,
      ['Smoke Manager', `smoke-manager-${uniqueSuffix()}@example.com`, 'hashed', 'manager']
    ));
    created.userId = seededUser.rows[0].id;

    const token = createToken(created.userId, 'manager');

    if (inSuite('core', 'ops', 'billing')) {
      const staff = await runStep('POST /api/staff', () => callApi('POST', '/api/staff', token, {
        name: 'Smoke Staff',
        email: `smoke-staff-${uniqueSuffix()}@example.com`,
        position: 'Housekeeping',
      }));
      created.staffId = staff.id;
      await runStep('GET /api/staff', () => callApi('GET', '/api/staff', token));
    }

    if (inSuite('core', 'billing', 'ops')) {
      const roomCreate = await runStep('POST /api/rooms (primary)', () => callApi('POST', '/api/rooms', token, {
        number: `S${uniqueSuffix().slice(0, 4).toUpperCase()}`,
        title: 'Smoke Test Room',
        type: 'Suite',
        price: 199,
        status: 'AVAILABLE',
        capacity: 2,
        amenities: ['WiFi'],
        policies: ['No smoking'],
        imageUrls: [],
      }));
      created.roomId = roomCreate.room.id;
      await runStep('GET /api/rooms', () => callApi('GET', '/api/rooms', token));
      await runStep('GET /api/rooms/:id', () => callApi('GET', `/api/rooms/${created.roomId}`, token));
      await runStep('PUT /api/rooms/:id', () => callApi('PUT', `/api/rooms/${created.roomId}`, token, { price: 249, status: 'OCCUPIED' }));

      const disposableRoom = await runStep('POST /api/rooms (disposable)', () => callApi('POST', '/api/rooms', token, {
        number: `D${uniqueSuffix().slice(0, 4).toUpperCase()}`,
        title: 'Disposable Room',
        type: 'Single',
        price: 89,
        status: 'AVAILABLE',
        capacity: 1,
      }));
      created.disposableRoomId = disposableRoom.room.id;

      const bookingRes = await runStep('POST /api/bookings', () => callApi('POST', '/api/bookings', token, {
        guestName: 'Smoke Guest',
        guestEmail: 'smoke-guest@example.com',
        phone: '9800000000',
        roomId: created.roomId,
        guestCount: 2,
        checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        checkOut: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      }));
      created.bookingId = bookingRes.booking.id;
      await runStep('GET /api/bookings', () => callApi('GET', '/api/bookings', token));
      await runStep('GET /api/bookings/my', () => callApi('GET', '/api/bookings/my', token));
      await runStep('PUT /api/bookings/:id/status', () => callApi('PUT', `/api/bookings/${created.bookingId}/status`, token, { status: 'CONFIRMED' }));
    }

    if (inSuite('billing')) {
      const paymentInit = await runStep('POST /api/payments/initiate', () => callApi('POST', '/api/payments/initiate', token, {
        bookingId: created.bookingId,
        method: 'CASH',
      }));
      await runStep('POST /api/payments/confirm', () => callApi('POST', '/api/payments/confirm', token, {
        transactionId: paymentInit.transactionId,
        otp: paymentInit.mockOtp,
      }));
      await runStep('GET /api/payments/history', () => callApi('GET', '/api/payments/history', token));
    }

    if (inSuite('ops')) {
      await runStep('seed inventory item', () => db.query(
        `INSERT INTO "Inventory" (item, name, quantity, status, "updatedAt")
         VALUES ($1, $2, $3, $4, NOW()) RETURNING id`,
        ['Smoke Soap', 'Smoke Soap', 30, 'LOW_STOCK']
      ).then((r) => {
        created.inventoryId = r.rows[0].id;
      }));
      await runStep('GET /api/inventory', () => callApi('GET', '/api/inventory', token));
      await runStep('PUT /api/inventory/:id', () => callApi('PUT', `/api/inventory/${created.inventoryId}`, token, { quantity: 120 }));

      await runStep('GET /api/menu', () => callApi('GET', '/api/menu', token));
      const categoryRes = await runStep('load menu category', () => db.query('SELECT id FROM menu_categories ORDER BY sort_order ASC LIMIT 1'));
      const menuCreate = await runStep('POST /api/menu', () => callApi('POST', '/api/menu', token, {
        categoryId: categoryRes.rows[0]?.id || null,
        name: `Smoke Item ${uniqueSuffix()}`,
        description: 'Smoke food item',
        price: 9.99,
        isVeg: true,
      }));
      created.menuItemId = menuCreate.item.id;

      await runStep('GET /api/housekeeping', () => callApi('GET', '/api/housekeeping', token));
      await runStep('PUT /api/housekeeping/:id', () => callApi('PUT', `/api/housekeeping/${created.roomId}`, token, { status: 'CLEANING' }));

      const roomServiceCreate = await runStep('POST /api/room-service', () => callApi('POST', '/api/room-service', token, {
        roomNumber: '101',
        bookingId: created.bookingId,
        menuItemId: created.menuItemId,
        quantity: 2,
        specialRequest: 'No onion',
        guestName: 'Smoke Guest',
      }));
      created.roomServiceId = roomServiceCreate.id;
      await runStep('GET /api/room-service', () => callApi('GET', '/api/room-service', token));
      await runStep('PUT /api/room-service/:id', () => callApi('PUT', `/api/room-service/${created.roomServiceId}`, token, { status: 'PREPARING' }));

      await runStep('seed notification', () => db.query(
        `INSERT INTO notifications (title, message, status)
         VALUES ($1, $2, $3) RETURNING id`,
        ['Smoke Notification', 'Test notification', 'UNREAD']
      ).then((r) => {
        created.notificationId = r.rows[0].id;
      }));
      await runStep('GET /api/notifications', () => callApi('GET', '/api/notifications', token));
      await runStep('PUT /api/notifications/:id/read', () => callApi('PUT', `/api/notifications/${created.notificationId}/read`, token));

      await runStep('POST /api/attendance/check-in', () => callApi('POST', '/api/attendance/check-in', token, { staffId: created.staffId }));
      await runStep('GET /api/attendance/today', () => callApi('GET', '/api/attendance/today', token));
      await runStep('GET /api/attendance/history/:staffId', () => callApi('GET', `/api/attendance/history/${created.staffId}`, token));
      await runStep('POST /api/attendance/check-out', () => callApi('POST', '/api/attendance/check-out', token, { staffId: created.staffId }));

      const taskCreate = await runStep('POST /api/tasks', () => callApi('POST', '/api/tasks', token, {
        title: 'Smoke Task',
        description: 'Test task assignment',
        staffId: created.staffId,
      }));
      created.taskId = taskCreate.task.id;
      await runStep('GET /api/tasks', () => callApi('GET', '/api/tasks', token));
      await runStep('GET /api/tasks/staff/:id', () => callApi('GET', `/api/tasks/staff/${created.staffId}`, token));
      await runStep('PUT /api/tasks/:id', () => callApi('PUT', `/api/tasks/${created.taskId}`, token, { status: 'IN-PROGRESS' }));
      await runStep('GET /api/dashboard/analytics', () => callApi('GET', '/api/dashboard/analytics', token));
    }

    if (inSuite('billing')) {
      const invoice = await runStep('POST /api/billing', () => callApi('POST', '/api/billing', token, {
        bookingId: created.bookingId,
        amount: 99,
        method: 'CASH',
      }));
      created.invoiceId = invoice.id;
      await runStep('GET /api/billing', () => callApi('GET', '/api/billing', token));
      await runStep('PUT /api/billing/:id/pay', () => callApi('PUT', `/api/billing/${created.invoiceId}/pay`, token));
    }

    if (inSuite('ops')) {
      await runStep('DELETE /api/menu/:id', () => callApi('DELETE', `/api/menu/${created.menuItemId}`, token));
    }
    if (inSuite('core', 'billing', 'ops')) {
      await runStep('DELETE /api/bookings/:id', () => callApi('DELETE', `/api/bookings/${created.bookingId}`, token));
      await runStep('DELETE /api/rooms/:id', () => callApi('DELETE', `/api/rooms/${created.disposableRoomId}`, token));
    }
    try { if (created.disposableRoomId) await db.query('DELETE FROM rooms WHERE id = $1', [created.disposableRoomId]); } catch {}

    printReport();
    console.log(`Phase 4 smoke pass (${selectedSuite}) completed successfully.`);
  } finally {
    // Best-effort cleanup for synthetic data.
    try { if (created.taskId) await db.query('DELETE FROM tasks WHERE id = $1', [created.taskId]); } catch {}
    try { if (created.roomServiceId) await db.query('DELETE FROM room_service WHERE id = $1', [created.roomServiceId]); } catch {}
    try { if (created.invoiceId) await db.query('DELETE FROM payments WHERE id = $1', [created.invoiceId]); } catch {}
    try { if (created.inventoryId) await db.query('DELETE FROM "Inventory" WHERE id = $1', [created.inventoryId]); } catch {}
    try { if (created.notificationId) await db.query('DELETE FROM notifications WHERE id = $1', [created.notificationId]); } catch {}
    try { if (created.staffId) await db.query('DELETE FROM attendance WHERE staff_id = $1', [created.staffId]); } catch {}
    try { if (created.staffId) await db.query('DELETE FROM staff WHERE id = $1', [created.staffId]); } catch {}
    try { if (created.userId) await db.query('DELETE FROM users WHERE id = $1', [created.userId]); } catch {}
  }
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    printReport();
    console.error(error.message);
    process.exit(1);
  });
