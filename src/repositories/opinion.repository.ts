import { db } from "@/lib/db";
import crypto from "crypto";

export interface PendingReview {
    producto_variante_id: string;
    producto_id: string;
    nombre: string;
    imagen_url: string | null;
    fecha_compra: Date;
}

export interface CompletedReview {
    id: string;
    producto_variante_id: string;
    producto_id: string;
    nombre: string;
    imagen_url: string | null;
    estrellas: number;
    comentario: string;
    fecha: Date;
}

export const OpinionRepository = {
    async getPendingReviews(usuarioId: string): Promise<PendingReview[]> {
        const client = await db.getClient();
        try {
            const result = await client.query(`
                SELECT 
                    pv.id AS producto_variante_id,
                    p.id AS producto_id,
                    p.nombre,
                    COALESCE(pv.imagen_url, (
                        SELECT url_imagen FROM imagen WHERE producto_variante_id = pv.id LIMIT 1
                    )) AS imagen_url,
                    MAX(c.fecha) AS fecha_compra
                FROM compra c
                JOIN linea_de_compra lc ON lc.compra_id = c.id
                JOIN producto_variante pv ON lc.producto_variante_id = pv.id
                JOIN producto p ON pv.producto_id = p.id
                WHERE c.usuario_id = $1
                AND NOT EXISTS (
                    SELECT 1 FROM opinion o 
                    WHERE o.usuario_id = c.usuario_id 
                    AND o.producto_variante_id = pv.id
                )
                GROUP BY pv.id, p.id, p.nombre, pv.imagen_url
                ORDER BY MAX(c.fecha) DESC;
            `, [usuarioId]);
            return result.rows;
        } finally {
            client.release();
        }
    },

    async getCompletedReviews(usuarioId: string): Promise<CompletedReview[]> {
        const client = await db.getClient();
        try {
            const result = await client.query(`
                SELECT 
                    o.id,
                    pv.id AS producto_variante_id,
                    p.id AS producto_id,
                    p.nombre,
                    COALESCE(pv.imagen_url, (
                        SELECT url_imagen FROM imagen WHERE producto_variante_id = pv.id LIMIT 1
                    )) AS imagen_url,
                    o.estrellas,
                    o.comentario,
                    o.fecha
                FROM opinion o
                JOIN producto_variante pv ON o.producto_variante_id = pv.id
                JOIN producto p ON pv.producto_id = p.id
                WHERE o.usuario_id = $1
                ORDER BY o.fecha DESC;
            `, [usuarioId]);
            return result.rows;
        } finally {
            client.release();
        }
    },

    async crearOpinion(usuarioId: string, varianteId: string, estrellas: number, comentario: string) {
        const client = await db.getClient();
        try {
            const id = crypto.randomUUID().slice(0, 8); // VARCHAR constraint
            await client.query(`
                INSERT INTO opinion (id, usuario_id, producto_variante_id, estrellas, comentario, fecha)
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            `, [id, usuarioId, varianteId, estrellas, comentario]);
            return id;
        } finally {
            client.release();
        }
    }
};
