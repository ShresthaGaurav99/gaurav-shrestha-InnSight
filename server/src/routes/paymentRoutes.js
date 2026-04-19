const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const gatewayController = require('../controllers/gatewayController');
const auth = require('../middleware/authMiddleware');

// Route to initiate payment and get OTP
router.post('/initiate', auth, paymentController.initiatePayment);

// Route to verify OTP and confirm payment
router.post('/confirm', auth, paymentController.confirmPayment);

// Route to get payment history
router.get('/history', auth, paymentController.getUserPayments);

// eSewa + Khalti gateway endpoints
router.post('/esewa/initiate', auth, gatewayController.esewaInitiate);
router.get('/esewa/form/:transactionUuid', gatewayController.esewaForm);
router.get('/esewa/return/:outcome', gatewayController.esewaReturn);

router.post('/khalti/initiate', auth, gatewayController.khaltiInitiate);
router.get('/khalti/return', gatewayController.khaltiReturn);

module.exports = router;
