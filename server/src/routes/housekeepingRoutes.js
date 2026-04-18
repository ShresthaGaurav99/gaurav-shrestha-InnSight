const express = require('express');
const router = express.Router();
const housekeepingController = require('../controllers/housekeepingController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, housekeepingController.getHousekeeping);
router.put('/:id', auth, housekeepingController.updateHousekeepingStatus);

module.exports = router;
