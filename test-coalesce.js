const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:425262@localhost:5432/camiseria-urbana-3' });

async function run() {
  try {
    const res = await pool.query("SELECT COALESCE(ARRAY['abc', 'def'], '{}') as c1, COALESCE(NULL::text[], '{}') as c2");
    console.log(res.rows[0]);
    console.log("Type of c1:", typeof res.rows[0].c1);
    console.log("IsArray c1:", Array.isArray(res.rows[0].c1));
  } catch(e) { console.error(e); } finally { pool.end(); }
}
run();
