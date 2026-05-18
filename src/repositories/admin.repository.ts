// src/repositories/admin.repository.ts
import { db } from "@/lib/db";

// Definimos las interfaces de los datos entrantes
export interface NuevaVarianteDTO {
  talle: string;
  color: string;
  material: string;
  precio: number;
  imagenUrl: string;
}

export interface NuevoProductoDTO {
  nombre: string;
  descripcion: string;
  codigo: string;
  variantes: NuevaVarianteDTO[];
}

export interface NuevoIngresoStockDTO {
  proveedorId: string;
  varianteId: string;
  cantidad: number;
  costo: number;
}

export const AdminRepository = {
  
  // PBI-23: Cargar Producto (Transaccional)
  async crearProductoConVariantes(producto: NuevoProductoDTO) {
    // Importante: Si 'db' es un Pool de pg, necesitamos un cliente dedicado para la transacción
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN'); // Iniciamos la transacción

      // 1. Insertamos el producto base
      const prodId = `P${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
      await client.query(
        `INSERT INTO producto (id, nombre, descripcion, codigo) VALUES ($1, $2, $3, $4)`,
        [prodId, producto.nombre, producto.descripcion, producto.codigo]
      );

      // 2. Insertamos todas sus variantes
      for (const [index, variante] of producto.variantes.entries()) {
        const varId = `V-${prodId}-${index}`;
        await client.query(
          `INSERT INTO producto_variante (id, producto_id, talle, color, material, precio, imagen_url) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [varId, prodId, variante.talle, variante.color, variante.material, variante.precio, variante.imagenUrl]
        );
      }

      await client.query('COMMIT'); // Si todo salió bien, guardamos los cambios
      return prodId;

    } catch (error) {
      await client.query('ROLLBACK'); // Si algo falló, deshacemos todo para no dejar datos huérfanos
      console.error("Error en la transacción de creación de producto:", error);
      throw new Error("No se pudo crear el producto y sus variantes.");
    } finally {
      client.release(); // Liberamos la conexión
    }
  },

  // PBI-24: Gestionar Stock (Exclusivo por Compras a Proveedores)
  async registrarIngresoStock(ingreso: NuevoIngresoStockDTO) {
    const idCompra = `CP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const fechaActual = new Date().toISOString();

    const query = `
      INSERT INTO compra_proveedor (id, proveedor_id, producto_variante_id, cantidad, costo, fecha)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    await db.query(query, [
      idCompra, 
      ingreso.proveedorId, 
      ingreso.varianteId, 
      ingreso.cantidad, 
      ingreso.costo, 
      fechaActual
    ]);
  },

  // PBI-XX: Listar Productos para el Dashboard
  async getProductosParaDashboard() {
    const query = `
      SELECT 
        p.id, 
        p.nombre, 
        p.codigo,
        COUNT(v.id) as cantidad_variantes,
        COALESCE(MIN(v.precio), 0) as precio_base,
        COALESCE(SUM(s.stock_disponible), 0) as stock_total
      FROM producto p
      LEFT JOIN producto_variante v ON p.id = v.producto_id
      LEFT JOIN v_stock_actual s ON v.id = s.producto_variante_id
      GROUP BY p.id, p.nombre, p.codigo
      ORDER BY p.nombre ASC;
    `;
    const result = await db.query(query);
    return result.rows;
  }
};