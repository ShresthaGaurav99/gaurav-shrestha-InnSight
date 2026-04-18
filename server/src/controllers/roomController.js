const db = require('../config/db');

const mapRoom = (room) => ({
  ...room,
  amenities: Array.isArray(room.amenities) ? room.amenities : [],
  policies: Array.isArray(room.policies) ? room.policies : [],
  image_urls: Array.isArray(room.image_urls) ? room.image_urls : [],
});

const roomSelect = `
  SELECT
    id,
    number,
    title,
    type,
    price,
    status,
    capacity,
    bed_type,
    size_sqft,
    amenities,
    description,
    policies,
    image_urls,
    location,
    "createdAt",
    "updatedAt"
  FROM rooms
`;

exports.getAllRooms = async (req, res) => {
  try {
    const result = await db.query(`${roomSelect} ORDER BY number ASC`);
    res.json(result.rows.map(mapRoom));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const result = await db.query(`${roomSelect} WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(mapRoom(result.rows[0]));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room details', error: error.message });
  }
};

exports.addRoom = async (req, res) => {
  const {
    number,
    roomNumber,
    title,
    type,
    price,
    status,
    capacity = 2,
    bedType = 'Queen Bed',
    sizeSqft = 280,
    amenities = [],
    description = '',
    policies = [],
    imageUrls = [],
    location = 'Kathmandu, Nepal',
  } = req.body;

  const normalizedNumber = number || roomNumber;

  try {
    const checkRoom = await db.query('SELECT id FROM rooms WHERE number = $1', [normalizedNumber]);
    if (checkRoom.rows.length > 0) {
      return res.status(400).json({ message: `Room ${normalizedNumber} already exists` });
    }

    const normalizedStatus = (status || 'AVAILABLE').toUpperCase();
    const numericPrice = parseFloat(price);
    const numericCapacity = parseInt(capacity, 10);

    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ message: 'Invalid price' });
    }

    if (!normalizedNumber || !type) {
      return res.status(400).json({ message: 'Room number and room type are required' });
    }

    const result = await db.query(
      `INSERT INTO rooms
       (number, title, type, price, status, capacity, bed_type, size_sqft, amenities, description, policies, image_urls, location, "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11::jsonb, $12::jsonb, $13, NOW())
       RETURNING *`,
      [
        normalizedNumber,
        title || `${type} Room ${normalizedNumber}`,
        type,
        numericPrice,
        normalizedStatus,
        Number.isNaN(numericCapacity) ? 2 : numericCapacity,
        bedType,
        parseInt(sizeSqft, 10) || 280,
        JSON.stringify(amenities),
        description,
        JSON.stringify(policies),
        JSON.stringify(imageUrls),
        location,
      ]
    );
    res.status(201).json({ message: 'Room added successfully', room: mapRoom(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ message: 'Error adding room', error: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  const { id } = req.params;
  const {
    number,
    roomNumber,
    title,
    type,
    price,
    status,
    capacity,
    bedType,
    sizeSqft,
    amenities,
    description,
    policies,
    imageUrls,
    location,
  } = req.body;

  try {
    const roomCheck = await db.query(`${roomSelect} WHERE id = $1`, [id]);
    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const currentRoom = roomCheck.rows[0];
    const newNumber = number || roomNumber || currentRoom.number;
    const newType = type || currentRoom.type;
    const newTitle = title || currentRoom.title || `${newType} Room ${newNumber}`;
    const newPrice = price !== undefined ? parseFloat(price) : currentRoom.price;
    const newStatus = (status || currentRoom.status).toUpperCase();
    const newCapacity = capacity !== undefined ? parseInt(capacity, 10) : currentRoom.capacity;
    const newBedType = bedType || currentRoom.bed_type;
    const newSizeSqft = sizeSqft !== undefined ? parseInt(sizeSqft, 10) : currentRoom.size_sqft;
    const newAmenities = amenities !== undefined ? amenities : currentRoom.amenities;
    const newPolicies = policies !== undefined ? policies : currentRoom.policies;
    const newImageUrls = imageUrls !== undefined ? imageUrls : currentRoom.image_urls;
    const newDescription = description !== undefined ? description : currentRoom.description;
    const newLocation = location || currentRoom.location;

    if (isNaN(newPrice) || newPrice < 0) {
      return res.status(400).json({ message: 'Invalid price' });
    }

    const result = await db.query(
      `UPDATE rooms
       SET number = $1,
           title = $2,
           type = $3,
           price = $4,
           status = $5,
           capacity = $6,
           bed_type = $7,
           size_sqft = $8,
           amenities = $9::jsonb,
           description = $10,
           policies = $11::jsonb,
           image_urls = $12::jsonb,
           location = $13,
           "updatedAt" = NOW()
       WHERE id = $14
       RETURNING *`,
      [
        newNumber,
        newTitle,
        newType,
        newPrice,
        newStatus,
        Number.isNaN(newCapacity) ? currentRoom.capacity : newCapacity,
        newBedType,
        Number.isNaN(newSizeSqft) ? currentRoom.size_sqft : newSizeSqft,
        JSON.stringify(newAmenities),
        newDescription,
        JSON.stringify(newPolicies),
        JSON.stringify(newImageUrls),
        newLocation,
        id,
      ]
    );

    res.json({ message: 'Room updated successfully', room: mapRoom(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ message: 'Error updating room', error: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM rooms WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room', error: error.message });
  }
};
