const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:425262@localhost:5432/camiseria-urbana-3' });

async function run() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'v_producto_detalle';
    `);
    console.log(res.rows);
  } catch(e) { console.error(e); } finally { pool.end(); }
}
run();
