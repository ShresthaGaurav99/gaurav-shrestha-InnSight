const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, authorize } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);

router.get('/staff', [auth, authorize('manager')], async (req, res) => {
    try {
        const db = require('../config/db');
        const result = await db.query("SELECT id, name as fullName, email FROM users WHERE role = 'staff'");
        res.json(result.rows);
    } catch (err) {
        console.error('Fetch staff error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
