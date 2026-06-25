import { db } from "@/lib/db";
import ComboForm from "./ComboForm";

export const dynamic = 'force-dynamic';

export default async function NuevoComboPage() {
  const client = await db.getClient();
  try {
    const query = `
      SELECT v.variante_id, v.nombre, v.talle, v.color, v.precio 
      FROM v_producto_detalle v
      JOIN producto p ON v.producto_id = p.id
      WHERE p.activo = true
      ORDER BY v.nombre ASC, v.talle ASC;
    `;
    const result = await client.query(query);
    const availableVariants = result.rows;

    return <ComboForm availableVariants={availableVariants} />;
  } catch (error) {
    console.error("Error fetching available variants:", error);
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-red-600">Error al cargar productos</h1>
        <p className="text-gray-500 mt-2">Ocurrió un error al cargar las variantes disponibles. Intenta recargar la página.</p>
      </div>
    );
  } finally {
    client.release();
  }
}
