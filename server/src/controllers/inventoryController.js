const db = require('../config/db');

exports.getInventory = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Inventory" ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStock = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  try {
    const currentQty = parseInt(quantity);
    const newStatus = currentQty > 100 ? 'AVAILABLE' : (currentQty > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK');
    
    const result = await db.query(
      'UPDATE "Inventory" SET quantity = $1, status = $2, "updatedAt" = NOW() WHERE id = $3 RETURNING *',
      [currentQty, newStatus, id]
    );
    
    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Stock updated', item: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

