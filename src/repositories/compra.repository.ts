import { db } from "@/lib/db";

export class CompraRepository {
  static async obtenerHistorialCompras(usuarioId: string) {
    const client = await db.getClient();
    try {
      // JSON_AGG to aggregate the order lines into each purchase efficiently.
      // COALESCE(p.nombre, cb.nombre) handles both variants and combos.
      const query = `
        SELECT 
          c.id,
          c.numero,
          c.fecha,
          c.total,
          c.estado_pago,
          COALESCE(
            json_agg(
              json_build_object(
                'cantidad', lc.cantidad,
                'precio_unitario', lc.precio_unitario,
                'producto_nombre', COALESCE(p.nombre, cb.nombre),
                'talle', pv.talle,
                'imagen_url', pv.imagen_url
              )
            ) FILTER (WHERE lc.id IS NOT NULL), 
            '[]'
          ) as lineas
        FROM compra c
        LEFT JOIN linea_de_compra lc ON c.id = lc.compra_id
        LEFT JOIN producto_variante pv ON lc.producto_variante_id = pv.id
        LEFT JOIN producto p ON pv.producto_id = p.id
        LEFT JOIN combo cb ON lc.combo_id = cb.id
        WHERE c.usuario_id = $1
        GROUP BY c.id, c.numero, c.fecha, c.total, c.estado_pago
        ORDER BY c.fecha DESC
      `;
      const result = await client.query(query, [usuarioId]);
      return result.rows;
    } finally {
      client.release();
    }
  }
}
