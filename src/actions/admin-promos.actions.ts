// src/actions/admin-promos.actions.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface PromoData {
  tipo: 'descuento' | '2x1';
  descripcion: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;    // YYYY-MM-DD
  descuento?: number;
}

export async function crearCampanaPromocional(promoData: PromoData, varianteIds: string[]) {
  if (!varianteIds || varianteIds.length === 0) {
    throw new Error("Se requiere al menos una variante para la promoción.");
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // randomUUID is available globally in Node.js 19+, or crypto.randomUUID()
    const promocionId = crypto.randomUUID();

    // 1. Insertar la promoción
    const insertQuery = `
      INSERT INTO promocion (id, tipo, descripcion, fecha_inicio, fecha_fin, descuento)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    await client.query(insertQuery, [
      promocionId,
      promoData.tipo,
      promoData.descripcion,
      promoData.fechaInicio,
      promoData.fechaFin,
      promoData.descuento || null
    ]);

    // 2. Actualizar las variantes masivamente
    const updateQuery = `
      UPDATE producto_variante 
      SET promocion_id = $1 
      WHERE id = ANY($2)
    `;

    await client.query(updateQuery, [promocionId, varianteIds]);

    await client.query('COMMIT');

    // Invalidar caché público
    revalidatePath("/", "layout");

    return { success: true, promocionId };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creando campaña promocional:", error);
    throw new Error("No se pudo crear la campaña promocional.");
  } finally {
    client.release();
  }
}
