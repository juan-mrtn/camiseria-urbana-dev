import { db } from "@/lib/db";
import crypto from "crypto";

export const FavoritoRepository = {
    // Obtener los favoritos del usuario
    async getFavoritosPorUsuario(usuarioId: string) {
        const client = await db.getClient();
        try {
            // Usamos explícitamente imagen_url, pero hacemos fallback a la tabla imagen si está nulo
            const result = await client.query(`
        SELECT 
            f.id AS favorito_id,
            pv.id AS producto_variante_id,
            p.id AS producto_id,
            p.nombre,
            pv.precio,
            COALESCE(pv.imagen_url, (
                SELECT url_imagen FROM imagen WHERE producto_variante_id = pv.id LIMIT 1
            )) AS imagen_url,
            COALESCE(AVG(o.estrellas), 0)::numeric(2,1) AS rating
        FROM favorito f
        JOIN producto_variante pv ON f.producto_variante_id = pv.id
        JOIN producto p ON pv.producto_id = p.id
        LEFT JOIN opinion o ON o.producto_variante_id = pv.id
        WHERE f.usuario_id = $1
        GROUP BY f.id, pv.id, p.id, p.nombre, pv.precio, pv.imagen_url
        ORDER BY f.id DESC;
      `, [usuarioId]);

            return result.rows;
        } finally {
            client.release();
        }
    },

    // Eliminar un favorito (Para el botón del tachito)
    async eliminarFavorito(favoritoId: string, usuarioId: string) {
        const client = await db.getClient();
        try {
            await client.query(`
        DELETE FROM favorito 
        WHERE id = $1 AND usuario_id = $2
      `, [favoritoId, usuarioId]);
            return { success: true };
        } finally {
            client.release();
        }
    },

    // Verificar si un producto es favorito (para el estado inicial del botón)
    async checkIsFavorito(usuarioId: string, varianteId: string) {
        const client = await db.getClient();
        try {
            const result = await client.query(`
                SELECT id FROM favorito 
                WHERE usuario_id = $1 AND producto_variante_id = $2
                LIMIT 1
            `, [usuarioId, varianteId]);
            return result.rowCount !== null && result.rowCount > 0;
        } finally {
            client.release();
        }
    },

    // Alternar el estado de favorito (Agregar o Quitar)
    async toggleFavorito(usuarioId: string, varianteId: string) {
        const client = await db.getClient();
        try {
            const check = await client.query(`
                SELECT id FROM favorito 
                WHERE usuario_id = $1 AND producto_variante_id = $2
                LIMIT 1
            `, [usuarioId, varianteId]);

            if (check.rowCount !== null && check.rowCount > 0) {
                // Ya es favorito, eliminar
                await client.query(`
                    DELETE FROM favorito 
                    WHERE usuario_id = $1 AND producto_variante_id = $2
                `, [usuarioId, varianteId]);
                return false; // Retorna el nuevo estado (false = no es favorito)
            } else {
                // No es favorito, agregar
                const id = crypto.randomUUID();
                await client.query(`
                    INSERT INTO favorito (id, usuario_id, producto_variante_id)
                    VALUES ($1, $2, $3)
                `, [id, usuarioId, varianteId]);
                return true; // Retorna el nuevo estado (true = es favorito)
            }
        } finally {
            client.release();
        }
    }
};