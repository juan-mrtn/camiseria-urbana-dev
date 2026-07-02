// src/actions/admin-promos.actions.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { enviarCorreoPromocional, generarHtmlPromocional } from "@/lib/email";
import { UsuarioRepository } from "@/repositories/usuario.repository";

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

    // --- SEND EMAILS ASYNCHRONOUSLY ---
    const envUserEmail = process.env.EMAIL_USER;
    if (envUserEmail) {
      const nombrePromocion = promoData.tipo === '2x1' ? '¡Promoción 2x1!' : `¡Descuento del ${promoData.descuento}%!`;
      const descripcion = promoData.descripcion;
      const ctaUrl = `${process.env.NEXTAUTH_URL}/ofertas`;

      try {
        const usuarios = await UsuarioRepository.obtenerUsuariosSuscritos();
        if (usuarios.length > 0) {
          const htmlContent = generarHtmlPromocional(
            nombrePromocion,
            descripcion,
            ctaUrl,
            promoData.tipo === '2x1' ? '2x1' : `-${promoData.descuento}%`
          );

          const results = await Promise.allSettled(
            usuarios.map((user) => 
              enviarCorreoPromocional(
                user.email,
                `¡Nueva Oferta Exclusiva: ${nombrePromocion}!`,
                htmlContent
              )
            )
          );
          console.log(`[Newsletter] Se procesaron ${results.length} correos para la promoción usando Nodemailer.`);
        }
      } catch (err) {
        console.error("[Newsletter] Error enviando emails de promoción:", err);
      }
    } else {
      console.warn("[Newsletter] No EMAIL_USER found, correos promocionales omitidos.");
    }
    // ----------------------------------

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
