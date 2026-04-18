const db = require('../config/db');

exports.getMenuCatalog = async (req, res) => {
  try {
    const categoriesResult = await db.query(`
      SELECT id, name, sort_order
      FROM menu_categories
      ORDER BY sort_order ASC, name ASC
    `);

    const itemsResult = await db.query(`
      SELECT
        mi.id,
        mi.name,
        mi.description,
        mi.price,
        mi.image_url,
        mi.is_veg,
        mi.spice_level,
        mi.is_available,
        mc.id AS category_id,
        mc.name AS category_name
      FROM menu_items mi
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      ORDER BY mc.sort_order ASC NULLS LAST, mi.name ASC
    `);

    const categories = categoriesResult.rows.map((category) => ({
      id: category.id,
      name: category.name,
      items: itemsResult.rows.filter((item) => item.category_id === category.id),
    }));

    res.json({
      categories,
      items: itemsResult.rows,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch menu', error: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  const {
    categoryId,
    name,
    description,
    price,
    imageUrl,
    isVeg = true,
    spiceLevel = 'Mild',
    isAvailable = true,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO menu_items
       (category_id, name, description, price, image_url, is_veg, spice_level, is_available, "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [categoryId || null, name, description || '', parseFloat(price || 0), imageUrl || null, !!isVeg, spiceLevel, !!isAvailable]
    );

    res.status(201).json({ item: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create menu item', error: error.message });
  }
};
