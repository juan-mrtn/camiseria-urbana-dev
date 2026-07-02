"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { enviarCorreoPromocional, generarHtmlPromocional } from "@/lib/email";
import { UsuarioRepository } from "@/repositories/usuario.repository";

export async function createComboAction(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const descripcion = formData.get("descripcion") as string;
  const precio = parseFloat(formData.get("precio") as string);
  const fecha_inicio = formData.get("fecha_inicio") as string;
  const fecha_fin = formData.get("fecha_fin") as string;
  const selectedItemsRaw = formData.get("selectedItems") as string;

  if (!nombre || !precio || !selectedItemsRaw) {
    return { success: false, error: "Faltan campos obligatorios" };
  }

  let selectedItems: { varianteId: string; cantidad: number }[] = [];
  try {
    selectedItems = JSON.parse(selectedItemsRaw);
    if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
      return { success: false, error: "Debes seleccionar al menos un producto para el combo" };
    }
  } catch (e) {
    return { success: false, error: "Formato de items inválido" };
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    
    const comboId = "C-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    const productoId = "P-" + comboId;
    const varianteId = "V-" + comboId;
    
    // 1. Create a dummy product to satisfy producto_variante FK
    await client.query(`
      INSERT INTO producto (id, nombre, descripcion, codigo, activo)
      VALUES ($1, $2, $3, $4, true)
    `, [productoId, `COMBO: ${nombre}`, descripcion, comboId]);

    // 2. Create a dummy variant to satisfy combo FK, with the image of the first item
    let comboImage = null;
    if (selectedItems.length > 0) {
      const imgRes = await client.query("SELECT imagen_url FROM producto_variante WHERE id = $1", [selectedItems[0].varianteId]);
      comboImage = imgRes.rows[0]?.imagen_url || null;
    }

    await client.query(`
      INSERT INTO producto_variante (id, producto_id, precio, talle, imagen_url)
      VALUES ($1, $2, $3, 'Pack', $4)
    `, [varianteId, productoId, precio, comboImage]);

    // 3. Insert into combo table
    await client.query(`
      INSERT INTO combo (id, nombre, descripcion, precio, producto_variante_id, fecha_inicio, fecha_fin)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [comboId, nombre, descripcion, precio, varianteId, fecha_inicio || null, fecha_fin || null]);

    // 4. Insert junction records into combo_item
    for (const item of selectedItems) {
      await client.query(`
        INSERT INTO combo_item (combo_id, producto_variante_id, cantidad)
        VALUES ($1, $2, $3)
      `, [comboId, item.varianteId, item.cantidad]);
    }

    await client.query("COMMIT");

    // --- SEND EMAILS ASYNCHRONOUSLY ---
    const envUserEmail = process.env.EMAIL_USER;
    if (envUserEmail) {
      try {
        const usuarios = await UsuarioRepository.obtenerUsuariosSuscritos();
        if (usuarios.length > 0) {
          const htmlContent = generarHtmlPromocional(
            nombre,
            descripcion,
            `${process.env.NEXTAUTH_URL}/combos/${comboId}`,
            `$${precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
          );

          const results = await Promise.allSettled(
            usuarios.map((user) => 
              enviarCorreoPromocional(
                user.email,
                `¡Nueva Oferta Exclusiva: ${nombre}!`,
                htmlContent
              )
            )
          );
          console.log(`[Newsletter] Se procesaron ${results.length} correos usando Nodemailer.`);
        }
      } catch (err) {
        console.error("[Newsletter] Error enviando emails:", err);
      }
    } else {
      console.warn("[Newsletter] No EMAIL_USER found, correos promocionales omitidos.");
    }
    // ----------------------------------

    revalidatePath("/(shop)/catalogo", "page");
    return { success: true, comboId };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating combo:", error);
    return { success: false, error: "Error interno al crear el combo" };
  } finally {
    client.release();
  }
}
