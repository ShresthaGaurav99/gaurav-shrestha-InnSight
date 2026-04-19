const express = require('express');
const router = express.Router();

const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, menuController.getMenuCatalog);
router.post('/', authMiddleware, menuController.createMenuItem);
router.delete('/:id', authMiddleware, menuController.deleteMenuItem);

module.exports = router;
