const express = require('express');
const router = express.Router();
const roomServiceController = require('../controllers/roomServiceController');
const { auth } = require('../middleware/auth');

router.get('/', auth, roomServiceController.getAllOrders);
router.post('/', auth, roomServiceController.createOrder);
router.put('/:id', auth, roomServiceController.updateOrderStatus);

module.exports = router;
