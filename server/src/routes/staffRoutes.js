const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, staffController.getAllStaff);
router.delete('/:id', auth, authorize('manager'), staffController.deleteStaff);

module.exports = router;
