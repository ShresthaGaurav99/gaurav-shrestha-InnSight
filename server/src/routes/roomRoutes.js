const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/rooms → fetch all rooms
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);

// POST /api/rooms → add new room
router.post('/', authMiddleware, roomController.addRoom);

// PUT /api/rooms/:id → update room
router.put('/:id', authMiddleware, roomController.updateRoom);

// DELETE /api/rooms/:id → delete room
router.delete('/:id', authMiddleware, roomController.deleteRoom);

module.exports = router;
