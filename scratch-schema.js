const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:425262@localhost:5432/camiseria-urbana-3' });

async function run() {
  try {
    const res1 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'combo'");
    console.log("COMBO SCHEMA:", res1.rows);
    
    const res2 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'combo_producto'");
    console.log("COMBO PRODUCTO SCHEMA:", res2.rows);

    const res3 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'v_stock_actual'");
    console.log("V_STOCK_ACTUAL SCHEMA:", res3.rows);

    const res4 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'v_carrito_detalle'");
    console.log("V_CARRITO_DETALLE SCHEMA:", res4.rows);
  } catch(e) { console.error(e); } finally { pool.end(); }
}
run();
