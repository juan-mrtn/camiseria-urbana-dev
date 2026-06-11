"use server";

import { db } from "@/lib/db";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function processCheckoutAction(
  usuarioId: string, 
  carritoId: string, 
  items: any[], 
  costoEnvio: number
) {
  try {
    // 1. Ejecutar procedimiento almacenado para congelar la orden
    await db.query("CALL sp_finalizar_compra($1, $2)", [usuarioId, carritoId]);

    // 2. Inicializar MercadoPago
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN as string 
    });

    // 3. Mapear los items del carrito para Mercado Pago
    const mpItems = items.map((item) => ({
      id: item.id.toString(),
      title: `${item.nombre} (Talle: ${item.talle})`,
      quantity: item.cantidad,
      unit_price: Number(item.precio),
      currency_id: "ARS",
      picture_url: item.imagen_url && !item.imagen_url.startsWith('/') ? item.imagen_url : undefined,
    }));

    // 4. Agregar el costo de envío como un item adicional
    if (costoEnvio > 0) {
      mpItems.push({
        id: "ENVIO",
        title: "Costo de Envío",
        quantity: 1,
        unit_price: costoEnvio,
        currency_id: "ARS",
        picture_url: undefined,
      });
    }

    // 5. Crear la preferencia
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "http://localhost:3000";
    
    const bodyPayload: any = {
      items: mpItems,
      back_urls: {
        success: `${baseUrl}/checkout/success`,
        failure: `${baseUrl}/checkout/failure`,
        pending: `${baseUrl}/checkout/pending`,
      },
      external_reference: carritoId,
    };

    // Mercado Pago requiere que back_urls sea HTTPS para permitir auto_return
    if (baseUrl.startsWith("https")) {
      bodyPayload.auto_return = "approved";
    }

    const preference = new Preference(client);
    const response = await preference.create({
      body: bodyPayload
    });

    return { success: true, preferenceId: response.id };
  } catch (error) {
    console.error("Error en processCheckoutAction:", error);
    return { success: false, error: "Error al procesar el pago." };
  }
}
