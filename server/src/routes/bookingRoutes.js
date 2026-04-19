const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, bookingController.getAllBookings);
router.get('/my', authMiddleware, bookingController.getMyBookings);
router.get('/customer/:email', authMiddleware, bookingController.getCustomerBookings);
router.post('/', authMiddleware, bookingController.createBooking);
router.put('/:id/status', authMiddleware, bookingController.updateStatus);
router.delete('/:id', authMiddleware, bookingController.deleteBooking);

module.exports = router;
