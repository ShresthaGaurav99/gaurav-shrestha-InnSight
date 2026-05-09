const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { auth } = require('../middleware/auth');

router.post('/check-in', auth, attendanceController.checkIn);
router.post('/check-out', auth, attendanceController.checkOut);
router.get('/today', auth, attendanceController.getTodayRoster);
router.get('/history/:email', auth, attendanceController.getHistory);

module.exports = router;
