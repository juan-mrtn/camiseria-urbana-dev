const { db } = require('./src/lib/db');

async function updateSP() {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query('DROP FUNCTION IF EXISTS public.fn_aplicar_promocion(numeric, character varying, integer)');
    const query = `
CREATE OR REPLACE FUNCTION public.fn_aplicar_promocion(p_precio_original numeric, p_promocion_id character varying, p_cantidad integer DEFAULT 1)
 RETURNS TABLE(precio_final numeric, descuento_unitario numeric)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_tipo tipo_promocion;
    v_descuento DECIMAL;
    v_cantidad_efectiva INT;
BEGIN
    -- Si no hay promoción, devolver el precio original sin descuento
    IF p_promocion_id IS NULL THEN
        RETURN QUERY SELECT p_precio_original, 0.00;
        RETURN;
    END IF;
    
    -- Obtener tipo y valor de descuento
    SELECT tipo, descuento INTO v_tipo, v_descuento
    FROM promocion
    WHERE id = p_promocion_id
      AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin;
    
    -- Si la promoción no está vigente, ignorarla (descuento 0)
    IF NOT FOUND THEN
        RETURN QUERY SELECT p_precio_original, 0.00;
        RETURN;
    END IF;
    
    -- Aplicar lógica según tipo
    CASE v_tipo
        WHEN 'descuento' THEN
            -- Descuento porcentual (ej. 15 = 15%)
            RETURN QUERY SELECT 
                ROUND(p_precio_original * (1 - (v_descuento / 100)), 2),
                ROUND(p_precio_original * (v_descuento / 100), 2);
                
        WHEN '2x1' THEN
            RETURN QUERY SELECT 
                ROUND(p_precio_original * 0.5, 2),
                ROUND(p_precio_original * 0.5, 2);
                
        ELSE
            -- Por defecto, sin descuento
            RETURN QUERY SELECT p_precio_original, 0.00;
    END CASE;
END;
$function$;
    `;
    await client.query(query);
    await client.query('COMMIT');
    console.log('Function updated successfully.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
  } finally {
    client.release();
    process.exit(0);
  }
}
updateSP();
