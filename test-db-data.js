const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:425262@localhost:5432/camiseria-urbana-3' });

async function run() {
  try {
    const res = await pool.query("SELECT * FROM imagen ORDER BY id DESC LIMIT 5");
    console.log(res.rows);
  } catch(e) { console.error(e); } finally { pool.end(); }
}
run();
