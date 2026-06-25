import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ComboDetailClient from "./ComboDetailClient";
import { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const client = await db.getClient();
  try {
    const result = await client.query("SELECT nombre, descripcion FROM combo WHERE id = $1", [p.id]);
    if (result.rowCount === 0) return { title: "Combo no encontrado" };
    return {
      title: `${result.rows[0].nombre} | Camisería Urbana`,
      description: result.rows[0].descripcion,
    };
  } finally {
    client.release();
  }
}

export default async function ComboPage({ params }: Props) {
  const p = await params;
  const { id } = p;

  const client = await db.getClient();

  try {
    // Fetch combo details
    const comboQuery = `
      SELECT 
        c.id, 
        c.nombre, 
        c.descripcion, 
        c.precio, 
        vd.imagen_principal, 
        vd.galeria_imagenes 
      FROM combo c
      LEFT JOIN v_producto_detalle vd ON c.producto_variante_id = vd.variante_id
      WHERE c.id = $1
    `;
    const comboResult = await client.query(comboQuery, [id]);

    if (comboResult.rowCount === 0) {
      notFound();
    }

    const combo = comboResult.rows[0];

    const itemsQuery = `
      SELECT 
        ci.cantidad, 
        vd.nombre, 
        vd.imagen_principal, 
        vd.talle 
      FROM combo_item ci
      JOIN v_producto_detalle vd ON ci.producto_variante_id = vd.variante_id
      WHERE ci.combo_id = $1
    `;
    const itemsResult = await client.query(itemsQuery, [id]);
    const comboItems = itemsResult.rows;

    // Build the gallery from the items' images
    const itemImages = comboItems.map(item => item.imagen_principal).filter(Boolean);
    combo.imagen_principal = itemImages[0] || "/camisa.png";
    combo.galeria_imagenes = itemImages.slice(1);

    // Fetch real-time stock for this combo
    const stockQuery = `
      SELECT stock_disponible 
      FROM v_stock_actual 
      WHERE producto_variante_id = $1 AND tipo_item = 'combo'
    `;
    const stockResult = await client.query(stockQuery, [id]);
    const stockDisponible = stockResult.rowCount && stockResult.rowCount > 0 
      ? Number(stockResult.rows[0].stock_disponible) 
      : 0;

    return (
      <ComboDetailClient 
        combo={combo} 
        comboItems={itemsResult.rows} 
        stockDisponible={stockDisponible} 
      />
    );
  } catch (error) {
    console.error("Error fetching combo details:", error);
    notFound();
  } finally {
    client.release();
  }
}
