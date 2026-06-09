// src/repositories/admin.repository.ts
import { db } from "@/lib/db";
import crypto from "crypto";

// Definimos las interfaces de los datos entrantes
export interface NuevaVarianteDTO {
  talle: string;
  color: string;
  material: string;
  precio: number;
  imagenUrls: string[];
}

export interface NuevoProductoDTO {
  productoId: string;
  variantes: NuevaVarianteDTO[];
}

export interface NuevoIngresoStockDTO {
  proveedorId: string;
  nombreProducto: string;
  talle: string;
  cantidad: number;
  costoUnitario: number;
}

export const AdminRepository = {

  async getExistingProductCodes(): Promise<string[]> {
    const query = `SELECT DISTINCT codigo FROM producto WHERE codigo IS NOT NULL ORDER BY codigo ASC`;
    const result = await db.query(query);
    return result.rows.map((row: any) => row.codigo);
  },

  async crearProveedor(nombre: string, contacto: string) {
    const id = `PROV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    await db.query(`INSERT INTO proveedor (id, nombre, contacto) VALUES ($1, $2, $3)`, [id, nombre, contacto]);
    return id;
  },

  async crearProductoBase(nombre: string, descripcion: string, codigo: string) {
    const id = `P-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    await db.query(
      `INSERT INTO producto (id, nombre, descripcion, codigo) VALUES ($1, $2, $3, $4)`,
      [id, nombre, descripcion, codigo]
    );
    return id;
  },

  async getProveedores() {
    const result = await db.query(`SELECT id, nombre FROM proveedor ORDER BY nombre ASC`);
    return result.rows.map((row: any) => ({ id: row.id, nombre: row.nombre }));
  },

  async getProductosBase() {
    const result = await db.query(`SELECT id, nombre, codigo FROM producto ORDER BY nombre ASC`);
    return result.rows;
  },

  async getUnallocatedStock(productoId: string): Promise<number> {
    try {
      // Calculamos el total de stock ingresado para todas las variantes de este producto
      const res = await db.query(
        `SELECT SUM(cp.cantidad) as total_comprado 
         FROM compra_proveedor cp
         JOIN producto_variante pv ON cp.producto_variante_id = pv.id
         WHERE pv.producto_id = $1`,
        [productoId]
      );
      return parseInt(res.rows[0]?.total_comprado || "0", 10);
    } catch (e) {
      console.error("Error getUnallocatedStock:", e);
      return 0;
    }
  },

  async getAllVariantes() {
    const result = await db.query(`
      SELECT 
        p.nombre, 
        pv.talle, 
        p.nombre || ' - Talle ' || pv.talle as label
      FROM producto_variante pv
      JOIN producto p ON pv.producto_id = p.id
      ORDER BY p.nombre ASC, pv.talle ASC
    `);
    return result.rows.map((row: any) => ({
      nombre: row.nombre,
      talle: row.talle,
      label: row.label
    }));
  },

  // PBI-23: Cargar Producto (Transaccional)
  async crearProductoConVariantes(producto: NuevoProductoDTO) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const prodId = producto.productoId;

      // 2. Insertamos todas sus variantes
      for (const variante of producto.variantes) {
        const varId = `V-${prodId}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
        const mainImageUrl = (variante.imagenUrls && variante.imagenUrls.length > 0) ? variante.imagenUrls[0] : null;
        await client.query(
          `INSERT INTO producto_variante (id, producto_id, talle, color, material, precio, imagen_url) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [varId, prodId, variante.talle, variante.color, variante.material, variante.precio, mainImageUrl]
        );

        if (variante.imagenUrls && variante.imagenUrls.length > 1) {
          const extraImages = variante.imagenUrls.slice(1);
          for (const url of extraImages) {
            const imgId = `IMG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
            await client.query(
              `INSERT INTO imagen (id, producto_variante_id, url_imagen) VALUES ($1, $2, $3)`,
              [imgId, varId, url]
            );
          }
        }
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
    const query = `CALL sp_registrar_ingreso_stock($1, $2, $3, $4, $5)`;

    await db.query(query, [
      ingreso.nombreProducto,
      ingreso.talle,
      ingreso.proveedorId,
      ingreso.cantidad,
      ingreso.costoUnitario
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