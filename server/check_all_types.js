const db = require('./src/config/db');

async function checkAllTypes() {
  try {
    const res = await db.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND column_name = 'id'
    `);
    console.log('ID columns types:');
    res.rows.forEach(r => console.log(`${r.table_name}.id: ${r.data_type}`));
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

checkAllTypes();
