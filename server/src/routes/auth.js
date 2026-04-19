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
        db.db.all("SELECT id, full_name as fullName, email FROM users WHERE role = 'staff'", [], (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(rows);
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
