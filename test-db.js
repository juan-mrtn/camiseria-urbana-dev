const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:425262@localhost:5432/camiseria-urbana-3' });

async function run() {
  try {
    const res = await pool.query('SELECT variante_id, producto_id, imagen_principal, galeria_imagenes FROM v_producto_detalle LIMIT 5');
    console.log(res.rows);
  } catch(e) { console.error(e); } finally { pool.end(); }
}
run();
