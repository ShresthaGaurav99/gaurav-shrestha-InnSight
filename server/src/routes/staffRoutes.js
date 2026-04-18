const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, staffController.getAllStaff);
router.post('/', auth, staffController.addStaff);

module.exports = router;
