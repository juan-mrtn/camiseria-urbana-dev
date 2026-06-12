import { db } from "@/lib/db";
import crypto from "crypto";

export const CarritoRepository = {
    async getCartItemCount(usuarioId: string): Promise<number> {
        const client = await db.getClient();
        try {
            const result = await client.query(`
                SELECT COALESCE(SUM(ci.cantidad), 0) AS total
                FROM carrito c
                JOIN carrito_item ci ON c.id = ci.carrito_id
                WHERE c.usuario_id = $1 AND c.estado = 'abierto';
            `, [usuarioId]);

            return parseInt(result.rows[0].total, 10);
        } finally {
            client.release();
        }
    },

    async agregarItemAlCarrito(usuarioId: string, varianteId: string, cantidad: number, precioUnitario: number): Promise<void> {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // 1. Buscar carrito abierto
            let carritoResult = await client.query(`
                SELECT id FROM carrito WHERE usuario_id = $1 AND estado = 'abierto' LIMIT 1;
            `, [usuarioId]);

            let carritoId;

            // 2. Si no existe, crear uno
            if (carritoResult.rowCount === 0) {
                carritoId = crypto.randomUUID().slice(0, 8); // Ajusta si el id es varchar o uuid puro, usando string
                await client.query(`
                    INSERT INTO carrito (id, usuario_id, estado) VALUES ($1, $2, 'abierto');
                `, [carritoId, usuarioId]);
            } else {
                carritoId = carritoResult.rows[0].id;
            }

            // 3. Buscar si el item ya está en el carrito
            const itemResult = await client.query(`
                SELECT id, cantidad FROM carrito_item 
                WHERE carrito_id = $1 AND producto_variante_id = $2 LIMIT 1;
            `, [carritoId, varianteId]);

            if (itemResult.rowCount && itemResult.rowCount > 0) {
                // Si existe, sumar cantidad
                await client.query(`
                    UPDATE carrito_item 
                    SET cantidad = cantidad + $1 
                    WHERE id = $2;
                `, [cantidad, itemResult.rows[0].id]);
            } else {
                // Si no existe, insertar
                const itemId = crypto.randomUUID().slice(0, 8);
                await client.query(`
                    INSERT INTO carrito_item (id, carrito_id, producto_variante_id, cantidad, precio_unitario)
                    VALUES ($1, $2, $3, $4, $5);
                `, [itemId, carritoId, varianteId, cantidad, precioUnitario]);
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    async eliminarItemDelCarrito(usuarioId: string, varianteId: string): Promise<void> {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            const carritoResult = await client.query(`
                SELECT id FROM carrito WHERE usuario_id = $1 AND estado = 'abierto' LIMIT 1;
            `, [usuarioId]);

            if (carritoResult.rowCount && carritoResult.rowCount > 0) {
                const carritoId = carritoResult.rows[0].id;
                await client.query(`
                    DELETE FROM carrito_item 
                    WHERE carrito_id = $1 AND producto_variante_id = $2;
                `, [carritoId, varianteId]);
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    async getCartWithItems(usuarioId: string) {
        const client = await db.getClient();
        try {
            const query = `
                SELECT 
                    ci.producto_variante_id as id,
                    v.nombre,
                    v.precio,
                    v.talle,
                    ci.cantidad,
                    v.imagen_principal as imagen_url,
                    v.tipo_promocion,
                    v.valor_descuento
                FROM carrito c
                JOIN carrito_item ci ON c.id = ci.carrito_id
                JOIN v_producto_detalle v ON v.variante_id = ci.producto_variante_id
                WHERE c.usuario_id = $1 AND c.estado = 'abierto'
                ORDER BY ci.id ASC;
            `;
            const result = await client.query(query, [usuarioId]);

            return result.rows.map(row => {
                let precioFinal = Number(row.precio) || 0;
                if (row.tipo_promocion === 'Descuento' && row.valor_descuento) {
                    precioFinal = precioFinal * (1 - Number(row.valor_descuento) / 100);
                }

                return {
                    id: row.id,
                    nombre: row.nombre,
                    precio: precioFinal,
                    talle: row.talle || 'Único',
                    cantidad: Number(row.cantidad) || 1,
                    imagen_url: row.imagen_url && !row.imagen_url.includes('example.com') ? row.imagen_url : "/camisa.png"
                };
            });
        } finally {
            client.release();
        }
    },

    async getCarritoAbiertoId(usuarioId: string): Promise<string | null> {
        const result = await db.query(`SELECT id FROM carrito WHERE usuario_id = $1 AND estado = 'abierto' LIMIT 1`, [usuarioId]);
        return result.rowCount ? result.rows[0].id : null;
    },

    async validarPromocion(codigo: string): Promise<boolean> {
        const result = await db.query(`SELECT id FROM promocion WHERE id = $1 AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin`, [codigo]);
        return (result.rowCount ?? 0) > 0;
    },

    async aplicarPromocionACarrito(carritoId: string, promocionId: string): Promise<void> {
        const query = `
            UPDATE carrito_item ci
            SET promocion_id = $2,
                precio_unitario = f.precio_final,
                descuento_unitario = f.descuento_unitario
            FROM producto_variante pv, 
                 fn_aplicar_promocion(pv.precio, $2, ci.cantidad) f
            WHERE ci.carrito_id = $1
            AND ci.producto_variante_id = pv.id;
        `;
        await db.query(query, [carritoId, promocionId]);
    }
};
