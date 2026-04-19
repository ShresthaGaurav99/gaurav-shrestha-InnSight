const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, billingController.getAllInvoices);
router.post('/', auth, billingController.createInvoice);
router.put('/:id/pay', auth, billingController.markAsPaid);

module.exports = router;
