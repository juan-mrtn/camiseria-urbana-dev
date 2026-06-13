import nodemailer from 'nodemailer';
import { db } from '@/lib/db';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function enviarFacturaEmail(usuarioId: string, costoEnvio: number = 0) {
  const client = await db.getClient();
  try {
    // 1. Obtener datos del usuario
    const userResult = await client.query(
      `SELECT email, nombre FROM usuario WHERE id = $1`, 
      [usuarioId]
    );

    if (userResult.rowCount === 0) {
      console.error(`Usuario con ID ${usuarioId} no encontrado para envío de correo.`);
      return;
    }
    const { email, nombre } = userResult.rows[0];

    if (!email) {
      console.error(`El usuario ${usuarioId} no tiene email configurado.`);
      return;
    }

    // 2. Obtener la compra confirmada más reciente
    const compraResult = await client.query(
      `SELECT id, numero, fecha, total 
       FROM compra 
       WHERE usuario_id = $1 AND estado_pago = 'confirmado' 
       ORDER BY fecha DESC LIMIT 1`,
      [usuarioId]
    );

    if (compraResult.rowCount === 0) {
      console.error(`No se encontró una compra confirmada reciente para el usuario ${usuarioId}.`);
      return;
    }
    const compra = compraResult.rows[0];

    // 3. Obtener las líneas de la compra
    const lineasResult = await client.query(
      `SELECT 
         lc.cantidad, 
         lc.precio_unitario, 
         p.nombre as producto_nombre, 
         pv.talle 
       FROM linea_de_compra lc
       JOIN producto_variante pv ON lc.producto_variante_id = pv.id
       JOIN producto p ON pv.producto_id = p.id
       WHERE lc.compra_id = $1`,
      [compra.id]
    );

    const lineas = lineasResult.rows;

    // 4. Generar el HTML del Ticket / Factura
    let lineasHtml = lineas.map(linea => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${linea.producto_nombre} (Talle: ${linea.talle})</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${linea.cantidad}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${Number(linea.precio_unitario).toLocaleString('es-AR')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(Number(linea.precio_unitario) * Number(linea.cantidad)).toLocaleString('es-AR')}</td>
      </tr>
    `).join('');

    // Agregar fila de envío si existe
    if (costoEnvio > 0) {
      lineasHtml += `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #4f46e5; font-weight: bold;">Costo de Envío</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">1</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${costoEnvio.toLocaleString('es-AR')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #4f46e5; font-weight: bold;">$${costoEnvio.toLocaleString('es-AR')}</td>
      </tr>
      `;
    }

    const totalFinal = Number(compra.total) + costoEnvio;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-w-2xl; margin: 0 auto; color: #333; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">¡Gracias por tu compra, ${nombre || 'Cliente'}!</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">Tu pago ha sido confirmado con éxito.</p>
        </div>
        
        <div style="padding: 30px;">
          <div style="margin-bottom: 20px;">
            <strong>Número de Orden:</strong> #${compra.numero} <br>
            <strong>Fecha y Hora:</strong> ${new Date(compra.fecha).toLocaleString('es-AR')}
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Producto</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Cant.</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Precio Unit.</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${lineasHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 15px 10px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">Total:</td>
                <td style="padding: 15px 10px; text-align: right; font-weight: bold; border-top: 2px solid #ddd; font-size: 18px; color: #4f46e5;">
                  $${totalFinal.toLocaleString('es-AR')}
                </td>
              </tr>
            </tfoot>
          </table>
          
          <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px;">
            Este es un comprobante electrónico de tu compra en La Camisería Urbana. <br>
            Si tienes alguna duda, contáctanos respondiendo a este correo.
          </p>
        </div>
      </div>
    `;

    // 5. Enviar el correo
    const info = await transporter.sendMail({
      from: `"La Camisería Urbana" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Comprobante de Pago - Orden #${compra.numero}`,
      html: htmlContent,
    });

    console.log("Factura enviada por email exitosamente:", info.messageId);

  } catch (error) {
    console.error("Error crítico enviando el email de factura:", error);
    // Lanzamos el error hacia arriba si queremos manejarlo en la UI, 
    // pero el checkout success page atrapará esto para no fallar
    throw error;
  } finally {
    client.release();
  }
}
