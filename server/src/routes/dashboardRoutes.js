const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth } = require('../middleware/auth');

router.get('/analytics', auth, dashboardController.getAnalytics);

module.exports = router;
