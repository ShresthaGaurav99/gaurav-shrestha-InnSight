const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);

// Added for task assignment
router.get('/staff', async (req, res) => {
  try {
    const db = require('../config/db');
    const result = await db.query("SELECT id, name, email, role FROM users WHERE role = 'staff'");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
