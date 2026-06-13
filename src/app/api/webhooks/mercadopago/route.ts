import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { db } from '@/lib/db';
import { enviarFacturaEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || url.searchParams.get('topic');
    const id = url.searchParams.get('data.id') || url.searchParams.get('id');

    if (type === 'payment' && id) {
      // 1. Inicializar el SDK de Mercado Pago
      const client = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN as string,
      });

      const payment = new Payment(client);

      // 2. Obtener los detalles del pago
      const paymentData = await payment.get({ id: id });

      // 3. Verificar si el pago fue aprobado
      if (paymentData.status === 'approved') {
        const usuarioId = paymentData.external_reference;

        if (usuarioId) {
          // 4. Ejecutar el procedimiento almacenado para confirmar el pago en la base de datos
          await db.query("CALL sp_confirmar_pago($1)", [usuarioId]);

          // 5. Extraer costo de envío (si existe) desde Mercado Pago
          let costoEnvio = 0;
          if (paymentData.additional_info?.items) {
            const envioItem = paymentData.additional_info.items.find((item: any) => item.id === "ENVIO");
            if (envioItem) {
              costoEnvio = Number(envioItem.unit_price);
            }
          }

          // 6. Enviar el correo con la factura
          try {
            await enviarFacturaEmail(usuarioId, costoEnvio);
          } catch (emailError) {
            console.error("Webhook MP: Error enviando email (el pago sí fue confirmado)", emailError);
          }
        } else {
          console.error("Webhook MP: No se encontró external_reference (usuarioId) en el pago", id);
        }
      }
    }

    // Crucial: Siempre devolver 200 OK para que Mercado Pago sepa que recibimos el webhook
    return new NextResponse("OK", { status: 200 });

  } catch (error: any) {
    // Manejo de condición de carrera: Si el error es porque ya se procesó, devolver 200 OK.
    if (error?.message?.includes("No se encontró ninguna compra pendiente")) {
      console.log("Webhook ignorado: El pago ya había sido confirmado previamente.");
      return new NextResponse("OK", { status: 200 });
    }

    console.error("Error procesando Webhook de Mercado Pago:", error);
    // Devolvemos 500 para que Mercado Pago reintente en caso de fallo temporal de DB
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
