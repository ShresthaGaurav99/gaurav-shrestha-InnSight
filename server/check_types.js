const db = require('./src/config/db');

async function checkTypes() {
  try {
    const bookings = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'id'");
    console.log('Bookings ID type:', bookings.rows[0]);

    const roomService = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'room_service' AND column_name = 'booking_id'");
    console.log('Room Service booking_id type:', roomService.rows[0]);
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

checkTypes();
