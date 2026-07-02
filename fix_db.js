const { db } = require('./src/lib/db');

async function fixDiscounts() {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    console.log("Fixing decimal discounts...");
    const res = await client.query('UPDATE promocion SET descuento = descuento * 100 WHERE descuento > 0 AND descuento <= 1');
    console.log(`Updated ${res.rowCount} promotions.`);
    await client.query('COMMIT');
  } catch (err) {
    console.error("Error:", err);
    await client.query('ROLLBACK');
  } finally {
    client.release();
    process.exit(0);
  }
}

fixDiscounts();
