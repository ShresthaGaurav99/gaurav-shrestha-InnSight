const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, inventoryController.getInventory);
router.put('/:id', auth, inventoryController.updateStock);

module.exports = router;
