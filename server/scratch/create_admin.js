const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

async function createAdmin() {
    try {
        const password = await bcrypt.hash('admin123', 10);
        const res = await db.query(
            `INSERT INTO users (name, email, password, role, "updatedAt") VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
            ['Admin', 'admin@innsight.com', password, 'manager']
        );
        console.log('Admin created:', res.rows[0].email);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
createAdmin();
