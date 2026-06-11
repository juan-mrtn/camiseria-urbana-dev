import { db } from "@/lib/db";

export interface Banner {
  id: string;
  titulo: string;
  subtitulo: string;
  imagen_url: string;
  boton_texto: string;
  activo: boolean;
  orden: number;
}

export interface BannerData extends Banner {
  productos: string[]; // IDs de los productos asociados
}

export class BannerRepository {
  /**
   * Obtiene todos los banners activos para el storefront, ordenados.
   */
  static async getActiveBanners(): Promise<Banner[]> {
    const query = `
      SELECT id, titulo, subtitulo, imagen_url, boton_texto, activo, orden
      FROM hero_banner
      WHERE activo = true
      ORDER BY orden ASC;
    `;
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Obtiene todos los banners para el administrador.
   */
  static async getAllBanners(): Promise<Banner[]> {
    const query = `
      SELECT id, titulo, subtitulo, imagen_url, boton_texto, activo, orden
      FROM hero_banner
      ORDER BY orden ASC, titulo ASC;
    `;
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Cuenta cuántos banners existen.
   */
  static async getBannerCount(): Promise<number> {
    const query = `SELECT COUNT(*) FROM hero_banner`;
    const result = await db.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Obtiene un banner por su ID, incluyendo los IDs de productos asociados.
   */
  static async getBannerById(id: string): Promise<BannerData | null> {
    const queryBanner = `
      SELECT id, titulo, subtitulo, imagen_url, boton_texto, activo, orden
      FROM hero_banner
      WHERE id = $1;
    `;
    const resultBanner = await db.query(queryBanner, [id]);
    
    if (resultBanner.rows.length === 0) return null;
    
    const banner = resultBanner.rows[0];

    const queryProductos = `
      SELECT producto_id
      FROM hero_banner_producto
      WHERE banner_id = $1;
    `;
    const resultProductos = await db.query(queryProductos, [id]);
    
    return {
      ...banner,
      productos: resultProductos.rows.map(row => row.producto_id)
    };
  }

  /**
   * Obtiene los productos completos asociados a un banner (para la vista de colección).
   */
  static async getBannerProducts(bannerId: string): Promise<any[]> {
    const query = `
      SELECT 
        p.id, p.nombre, p.codigo,
        COALESCE((
          SELECT MIN(pv.precio) FROM producto_variante pv WHERE pv.producto_id = p.id
        ), 0) as precioBase,
        (
          SELECT pv.imagen_url FROM producto_variante pv 
          WHERE pv.producto_id = p.id AND pv.imagen_url IS NOT NULL 
          LIMIT 1
        ) as imagen
      FROM producto p
      JOIN hero_banner_producto hbp ON p.id = hbp.producto_id
      WHERE hbp.banner_id = $1;
    `;
    // Nota: Esta es una consulta simplificada, se deberá adaptar al formato que 
    // usa la tienda para renderizar ProductCard si es necesario
    const result = await db.query(query, [bannerId]);
    return result.rows.map(row => ({
      ...row,
      precioCalculado: Number(row.preciobase), // Temporal si no aplicamos promociones en esta consulta
      precioBase: Number(row.preciobase)
    }));
  }

  /**
   * Crea un nuevo banner y asocia productos
   */
  static async createBanner(data: Omit<BannerData, "id">): Promise<string> {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      const insertQuery = `
        INSERT INTO hero_banner (titulo, subtitulo, imagen_url, boton_texto, activo, orden)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `;
      
      const result = await client.query(insertQuery, [
        data.titulo, data.subtitulo, data.imagen_url, data.boton_texto || 'Ver Colección', data.activo, data.orden || 0
      ]);
      
      const newId = result.rows[0].id;
      
      // Asociar productos
      if (data.productos && data.productos.length > 0) {
        for (const prodId of data.productos) {
          await client.query(`INSERT INTO hero_banner_producto (banner_id, producto_id) VALUES ($1, $2)`, [newId, prodId]);
        }
      }
      
      await client.query('COMMIT');
      return newId;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Elimina un banner. Requiere que haya al menos 1 restante.
   */
  static async deleteBanner(id: string): Promise<void> {
    const count = await this.getBannerCount();
    if (count <= 1) {
      throw new Error("No se puede eliminar. Debe haber al menos un banner activo.");
    }
    
    const query = `DELETE FROM hero_banner WHERE id = $1`;
    await db.query(query, [id]);
  }
}
