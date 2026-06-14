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

            // 3. Buscar información base del producto y su promoción activa
            const infoResult = await client.query(`
                SELECT pv.precio, p.tipo_promocion, p.valor_descuento
                FROM producto_variante pv
                JOIN v_producto_detalle p ON p.variante_id = pv.id
                WHERE pv.id = $1
            `, [varianteId]);
            
            const info = infoResult.rows[0];
            const precioBase = Number(info?.precio) || precioUnitario;
            const tienePromo = !!info?.tipo_promocion;
            let tipoPromo = info?.tipo_promocion;
            let descuentoValor = Number(info?.valor_descuento) || 0;

            // 4. Buscar si el item ya está en el carrito
            const itemResult = await client.query(`
                SELECT id, cantidad FROM carrito_item 
                WHERE carrito_id = $1 AND producto_variante_id = $2 LIMIT 1;
            `, [carritoId, varianteId]);

            const existe = itemResult.rowCount && itemResult.rowCount > 0;
            const cantidadActual = existe ? Number(itemResult.rows[0].cantidad) : 0;
            const nuevaCantidad = cantidadActual + cantidad;

            // 5. Calcular nuevo precio unitario efectivo basado en la nueva cantidad
            let nuevoPrecioUnitario = precioBase;
            
            if (tienePromo) {
                if (tipoPromo === 'descuento') {
                    nuevoPrecioUnitario = precioBase * (1 - descuentoValor / 100);
                } else if (tipoPromo === '2x1') {
                    const pagables = Math.floor(nuevaCantidad / 2) + (nuevaCantidad % 2);
                    const totalLinea = precioBase * pagables;
                    nuevoPrecioUnitario = totalLinea / nuevaCantidad;
                }
            }

            if (existe) {
                // Si existe, actualizar cantidad y recalcular el precio unitario efectivo
                await client.query(`
                    UPDATE carrito_item 
                    SET cantidad = $1,
                        precio_unitario = $2
                    WHERE id = $3;
                `, [nuevaCantidad, nuevoPrecioUnitario, itemResult.rows[0].id]);
            } else {
                // Si no existe, insertar
                const itemId = crypto.randomUUID().slice(0, 8);
                await client.query(`
                    INSERT INTO carrito_item (id, carrito_id, producto_variante_id, cantidad, precio_unitario)
                    VALUES ($1, $2, $3, $4, $5);
                `, [itemId, carritoId, varianteId, cantidad, nuevoPrecioUnitario]);
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

    async actualizarCantidadItem(usuarioId: string, varianteId: string, nuevaCantidad: number): Promise<void> {
        if (nuevaCantidad <= 0) {
            throw new Error("Invalid quantity");
        }

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            const carritoResult = await client.query(`
                SELECT id FROM carrito WHERE usuario_id = $1 AND estado = 'abierto' LIMIT 1;
            `, [usuarioId]);

            if (carritoResult.rowCount && carritoResult.rowCount > 0) {
                const carritoId = carritoResult.rows[0].id;
                
                await client.query(`
                    UPDATE carrito_item 
                    SET cantidad = $1
                    WHERE carrito_id = $2 AND producto_variante_id = $3;
                `, [nuevaCantidad, carritoId, varianteId]);
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
                    v.precio as precio_base,
                    ci.precio_unitario,
                    v.talle,
                    ci.cantidad,
                    v.imagen_principal as imagen_url,
                    v.tipo_promocion,
                    v.valor_descuento,
                    fn_obtener_stock_real(ci.producto_variante_id) AS stock_disponible
                FROM carrito c
                JOIN carrito_item ci ON c.id = ci.carrito_id
                JOIN v_producto_detalle v ON v.variante_id = ci.producto_variante_id
                WHERE c.usuario_id = $1 AND c.estado = 'abierto'
                ORDER BY ci.id ASC;
            `;
            const result = await client.query(query, [usuarioId]);

            return result.rows.map(row => {
                return {
                    id: row.id,
                    nombre: row.nombre,
                    precio: Number(row.precio_unitario),
                    precioOriginal: Number(row.precio_base),
                    talle: row.talle || 'Único',
                    cantidad: Number(row.cantidad) || 1,
                    imagen_url: row.imagen_url && !row.imagen_url.includes('example.com') ? row.imagen_url : "/camisa.png",
                    stock_disponible: Number(row.stock_disponible) || 0,
                    promocion: row.tipo_promocion ? {
                        tipo: row.tipo_promocion,
                        descuento: Number(row.valor_descuento) || 0
                    } : null
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
            FROM (
                SELECT 
                    ci_inner.id AS item_id, 
                    COALESCE(pv.precio, cb.precio, ci_inner.precio_unitario) AS precio_base, 
                    ci_inner.cantidad
                FROM carrito_item ci_inner
                LEFT JOIN producto_variante pv ON ci_inner.producto_variante_id = pv.id
                LEFT JOIN combo cb ON ci_inner.combo_id = cb.id
                WHERE ci_inner.carrito_id = $1
            ) subq,
            LATERAL fn_aplicar_promocion(subq.precio_base, $2, subq.cantidad) f
            WHERE ci.id = subq.item_id;
        `;
        await db.query(query, [carritoId, promocionId]);
    }
};
