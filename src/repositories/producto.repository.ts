import { db } from "@/lib/db";

type ProductRow = {
  id: string;
  produto_id: string;
  nombre: string;
  codigo: string;
  variante_id: string | null;
  precio: number | null;
  url_imagen: string | null;
};

export interface CatalogoFilters {
  color?: string;
  talle?: string;
  material?: string;
  precio_min?: number;
  precio_max?: number;
  search?: string;
}

export const ProductoRepository = {
  async getAvailableFilterOptions() {
    try {
      const tallesRes = await db.query(`
        SELECT DISTINCT UPPER(TRIM(talle)) AS talle 
        FROM producto_variante 
        WHERE talle IS NOT NULL AND TRIM(talle) != ''
        ORDER BY talle ASC;
      `);
      
      const materialesRes = await db.query(`
        SELECT DISTINCT INITCAP(TRIM(material)) AS material 
        FROM producto_variante 
        WHERE material IS NOT NULL AND TRIM(material) != ''
        ORDER BY material ASC;
      `);

      return {
        talles: tallesRes.rows.map(r => r.talle as string),
        materiales: materialesRes.rows.map(r => r.material as string),
      };
    } catch (error) {
      console.error("ProductoRepository.getAvailableFilterOptions error:", error);
      return { talles: [], materiales: [] };
    }
  },

  async getPaginated({ page = 1, take = 12, filters = {}, sortBy = 'relevance' }: { page?: number; take?: number; filters?: CatalogoFilters, sortBy?: string }) {
    page = Number(page);
    take = Number(take);

    if (Number.isNaN(page) || page < 1) page = 1;
    if (Number.isNaN(take) || take < 1) take = 12;

    try {
      const offset = (page - 1) * take;

      const buildConditions = (startIdx: number) => {
        const vals: any[] = [];
        let conds = "1=1";
        
        if (filters.color) {
          vals.push(`%${filters.color}%`);
          conds += ` AND color ILIKE $${startIdx + vals.length - 1}`;
        }
        if (filters.talle) {
          vals.push(filters.talle);
          conds += ` AND talle ILIKE $${startIdx + vals.length - 1}`;
        }
        if (filters.material) {
          vals.push(`%${filters.material}%`);
          conds += ` AND material ILIKE $${startIdx + vals.length - 1}`;
        }
        if (filters.precio_min !== undefined && !Number.isNaN(filters.precio_min)) {
          vals.push(filters.precio_min);
          conds += ` AND precio >= $${startIdx + vals.length - 1}`;
        }
        if (filters.precio_max !== undefined && !Number.isNaN(filters.precio_max)) {
          vals.push(filters.precio_max);
          conds += ` AND precio <= $${startIdx + vals.length - 1}`;
        }
        if (filters.search) {
          vals.push(`%${filters.search}%`);
          conds += ` AND (nombre ILIKE $${startIdx + vals.length - 1} OR material ILIKE $${startIdx + vals.length - 1})`;
        }
        return { vals, conds };
      };

      const filterLogic = buildConditions(3); // values $1 and $2 are take and offset

      let orderLogic = "og.promedio_estrellas_sort DESC NULLS LAST, pf.producto_id DESC";
      if (sortBy === 'price_asc') {
          orderLogic = "pg.precio_final ASC, pf.producto_id ASC";
      } else if (sortBy === 'price_desc') {
          orderLogic = "pg.precio_final DESC, pf.producto_id DESC";
      }

      const productsQuery = `
        WITH productos_filtrados AS (
            SELECT DISTINCT producto_id
            FROM v_producto_detalle
            WHERE (${filterLogic.conds}) AND producto_id IN (SELECT id FROM producto WHERE activo = TRUE)
        ),
        opiniones_global AS (
            SELECT pv.producto_id, 
                   AVG(o.estrellas)::numeric(2,1) AS promedio_estrellas_real,
                   COALESCE(AVG(o.estrellas), 4.0)::numeric(2,1) AS promedio_estrellas_sort
            FROM producto_variante pv
            LEFT JOIN opinion o ON pv.id = o.producto_variante_id
            WHERE pv.producto_id IN (SELECT producto_id FROM productos_filtrados)
            GROUP BY pv.producto_id
        ),
        precios_global AS (
            SELECT producto_id, MIN(
                CASE 
                    WHEN tipo_promocion = 'descuento' AND valor_descuento IS NOT NULL 
                    THEN precio * (1 - valor_descuento / 100)
                    WHEN tipo_promocion = '2x1'
                    THEN precio * 0.5
                    ELSE precio
                END
            ) as precio_final
            FROM v_producto_detalle
            WHERE producto_id IN (SELECT producto_id FROM productos_filtrados)
            GROUP BY producto_id
        ),
        paginados AS (
            SELECT pf.producto_id, 
                   ROW_NUMBER() OVER(ORDER BY ${orderLogic}) as sort_order
            FROM productos_filtrados pf
            LEFT JOIN opiniones_global og ON pf.producto_id = og.producto_id
            LEFT JOIN precios_global pg ON pf.producto_id = pg.producto_id
            ORDER BY ${orderLogic}
            LIMIT $1 OFFSET $2
        )
        SELECT v.*, p.sort_order, og.promedio_estrellas_real as promedio_estrellas,
               COALESCE(vsa.stock_disponible, v.stock_disponible) as real_stock
        FROM v_producto_detalle v
        INNER JOIN paginados p ON v.producto_id = p.producto_id
        LEFT JOIN opiniones_global og ON v.producto_id = og.producto_id
        LEFT JOIN v_stock_actual vsa ON vsa.producto_variante_id = v.codigo AND vsa.tipo_item = 'combo'
        ORDER BY p.sort_order ASC, v.nombre ASC, v.variante_id ASC;
      `;

      const result = await db.query(productsQuery, [take, offset, ...filterLogic.vals]);

      const countLogic = buildConditions(1);
      const countQuery = `
        SELECT COUNT(DISTINCT producto_id) AS total 
        FROM v_producto_detalle 
        WHERE (${countLogic.conds}) AND producto_id IN (SELECT id FROM producto WHERE activo = TRUE)
      `;
      const totalCountResult = await db.query(countQuery, countLogic.vals);
      const totalCount = Number(totalCountResult.rows[0]?.total ?? 0);
      const totalPages = Math.ceil(totalCount / take);

      // 2. Agrupamos los resultados exactamente como en getById
      const grouped: Record<string, any> = {};

      for (const row of result.rows) {
        if (!grouped[row.producto_id]) {
          const precioBase = Number(row.precio) || 0;
          let precioFinal = precioBase;
          const promocionActiva = !!row.tipo_promocion;

          if (promocionActiva) {
            if (row.tipo_promocion === 'descuento' && row.valor_descuento) {
              precioFinal = precioBase * (1 - Number(row.valor_descuento) / 100);
            } else if (row.tipo_promocion === '2x1') {
              precioFinal = precioBase * 0.5;
            }
          }

          grouped[row.producto_id] = {
            id: row.producto_id,
            nombre: row.nombre,
            codigo: row.codigo,
            precioBase, 
            precioFinal,
            // Filtramos las URLs falsas de example.com generadas por el script de prueba
            imagenPrincipal: row.imagen_principal && !row.imagen_principal.includes('example.com') ? row.imagen_principal : (Array.isArray(row.galeria_imagenes) && row.galeria_imagenes.length > 0 && !row.galeria_imagenes[0].includes('example.com') ? row.galeria_imagenes[0] : null) || "/camisa.png",
            stockTotal: 0,
            promedio_estrellas: row.promedio_estrellas !== null ? Number(row.promedio_estrellas) : null,
            promocion: row.tipo_promocion ? {
              tipo: row.tipo_promocion,
              descuento: Number(row.valor_descuento)
            } : null,
            promocionActiva
          };
        } else if (grouped[row.producto_id].imagenPrincipal === "/camisa.png") {
          const fallbackImage = (row.imagen_principal && !row.imagen_principal.includes('example.com') ? row.imagen_principal : null) || (Array.isArray(row.galeria_imagenes) && row.galeria_imagenes.length > 0 && !row.galeria_imagenes[0].includes('example.com') ? row.galeria_imagenes[0] : null);
          if (fallbackImage) {
            grouped[row.producto_id].imagenPrincipal = fallbackImage;
          }
        }

        // Si tiene variante, parseamos su stock como en getById y lo sumamos
        if (row.variante_id) {
          const stockParseado = parseInt(row.real_stock as string) || parseInt(row.stock_disponible as string) || 0;
          grouped[row.producto_id].stockTotal += stockParseado;
        }
      }

      // 3. Mapeamos al formato exacto que espera tu ProductCard
      const productos = Object.values(grouped).map((p: any) => {
        const isCombo = p.codigo && p.codigo.startsWith('C-');
        
        return {
          id: isCombo ? p.codigo : p.id,
          nombre: p.nombre,
          precio: p.precioBase, // Keep for backward compatibility
          imagen: p.imagenPrincipal, 
          slug: p.codigo,
          stockDisponible: p.stockTotal,
          precioBase: p.precioBase,
          precioFinal: p.precioFinal,
          promedio_estrellas: p.promedio_estrellas,
          promocion: p.promocion,
          promocionActiva: p.promocionActiva,
          isCombo: isCombo
        };
      });

      return {
        productos,
        currentPage: page,
        totalPages,
      };
    } catch (error) {
      console.error("ProductoRepository.getPaginated error:", error);
      throw new Error("No se pudo cargar los productos");
    }
  },
  // src/repositories/producto.repository.ts

  async getById(productoId: string) {
    try {
      // Buscamos por la columna producto_id y ordenamos por variante para determinismo de imágenes
      const query = `
        SELECT v.* 
        FROM v_producto_detalle v 
        JOIN producto p ON v.producto_id = p.id 
        WHERE v.producto_id = $1 AND p.activo = TRUE 
        ORDER BY v.variante_id ASC;
      `;
      const result = await db.query(query, [productoId]);

      if (result.rows.length === 0) return null;

      // Obtener opiniones para las variantes de este producto
      const opinionesQuery = `
        SELECT o.id, o.estrellas, o.comentario, o.fecha, u.nombre as usuario_nombre
        FROM opinion o
        JOIN producto_variante pv ON o.producto_variante_id = pv.id
        LEFT JOIN usuario u ON o.usuario_id = u.id
        WHERE pv.producto_id = $1
        ORDER BY o.fecha DESC;
      `;
      const opinionesResult = await db.query(opinionesQuery, [productoId]);
      const opiniones = opinionesResult.rows;

      const promedio_estrellas = opiniones.length > 0 
        ? opiniones.reduce((acc, curr) => acc + Number(curr.estrellas), 0) / opiniones.length 
        : null;

      const base = result.rows[0];

      const variantes = result.rows.map(row => {
        // Mapeo del stock v_stock_actual
        const stockParseado = parseInt(row.stock_disponible as string) || 0;
        
        const precioBase = Number(row.precio) || 0;
        let precioFinal = precioBase;
        
        if (row.tipo_promocion) {
            if (row.tipo_promocion === 'descuento' && row.valor_descuento) {
                precioFinal = precioBase * (1 - Number(row.valor_descuento) / 100);
            } else if (row.tipo_promocion === '2x1') {
                precioFinal = precioBase * 0.5;
            }
        }
        
        return {
          id: row.variante_id,
          talle: row.talle || 'Único', 
          color: row.color || 'No especificado',
          material: row.material || 'No especificado',
          precio: precioBase,
          precioFinal: precioFinal,
          stock: stockParseado,
          imagen: row.imagen_principal
        };
      });

      const todasLasImagenes = result.rows.flatMap(row => [
        row.imagen_principal,
        ...(Array.isArray(row.galeria_imagenes) ? row.galeria_imagenes : [])
      ]).filter(img => img && !img.includes('example.com'));

      const imagenes = [...new Set(todasLasImagenes)];

      const stockTotal = variantes.reduce((acc, v) => acc + v.stock, 0);
      
      const basePrecio = Number(base.precio) || 0;
      let basePrecioFinal = basePrecio;
      const basePromocionActiva = !!base.tipo_promocion;
      
      if (basePromocionActiva) {
          if (base.tipo_promocion === 'descuento' && base.valor_descuento) {
              basePrecioFinal = basePrecio * (1 - Number(base.valor_descuento) / 100);
          } else if (base.tipo_promocion === '2x1') {
              basePrecioFinal = basePrecio * 0.5;
          }
      }

      return {
        id: base.producto_id,
        nombre: base.nombre,
        descripcion: base.descripcion,
        codigo: base.codigo,
        precioBase: basePrecio,
        precioFinal: basePrecioFinal,
        imagenes: imagenes.length > 0 ? imagenes : ['/camisa.png'],
        variantes,
        stockTotal,
        promedio_estrellas,
        opiniones,
        opinionesCount: opiniones.length,
        promocion: base.tipo_promocion ? {
          tipo: base.tipo_promocion,
          descuento: Number(base.valor_descuento)
        } : null,
        promocionActiva: basePromocionActiva
      };
    } catch (error) {
      console.error(error);
      throw new Error("Error al obtener producto por ID");
    }
  },

  async getProductosEnPromocion() {
    try {
      const query = `
        WITH en_promocion AS (
            SELECT DISTINCT producto_id
            FROM v_producto_detalle
            WHERE tipo_promocion IS NOT NULL AND producto_id IN (SELECT id FROM producto WHERE activo = TRUE)
        ),
        opiniones_avg AS (
            SELECT pv.producto_id, COALESCE(AVG(o.estrellas), NULL)::numeric(2,1) AS promedio_estrellas
            FROM producto_variante pv
            LEFT JOIN opinion o ON pv.id = o.producto_variante_id
            WHERE pv.producto_id IN (SELECT producto_id FROM en_promocion)
            GROUP BY pv.producto_id
        )
        SELECT v.*, oa.promedio_estrellas
        FROM v_producto_detalle v
        LEFT JOIN opiniones_avg oa ON v.producto_id = oa.producto_id
        WHERE v.tipo_promocion IS NOT NULL
        ORDER BY v.nombre ASC, v.variante_id ASC;
      `;
      const result = await db.query(query);

      const grouped: Record<string, any> = {};

      for (const row of result.rows) {
        if (!grouped[row.producto_id]) {
          let precioBase = Number(row.precio) || 0;
          let precioCalculado = precioBase;
          
          if (row.tipo_promocion?.toLowerCase() === 'descuento' && row.valor_descuento) {
              precioCalculado = precioBase * (1 - Number(row.valor_descuento) / 100);
          }
          
          grouped[row.producto_id] = {
            id: row.producto_id,
            nombre: row.nombre,
            codigo: row.codigo,
            precioBase,
            precioCalculado,
            promedio_estrellas: row.promedio_estrellas !== null ? Number(row.promedio_estrellas) : null,
            imagen: row.imagen_principal && !row.imagen_principal.includes('example.com') ? row.imagen_principal : "/camisa.png",
            slug: row.codigo,
            promocion: {
              tipo: row.tipo_promocion,
              descuento: Number(row.valor_descuento)
            }
          };
        } else if (grouped[row.producto_id].imagen === "/camisa.png") {
          const fallbackImage = row.imagen_principal && !row.imagen_principal.includes('example.com') ? row.imagen_principal : null;
          if (fallbackImage) {
            grouped[row.producto_id].imagen = fallbackImage;
          }
        }
      }

      return Object.values(grouped);
    } catch (error) {
      console.error("Error al obtener productos en promoción:", error);
      throw new Error("No se pudo cargar las promociones");
    }
  },

  async obtenerProductosDestacados() {
    try {
      const query = `
        WITH ranked_productos AS (
            SELECT p.id, COALESCE(SUM(lc.cantidad), 0) as total_ventas
            FROM producto p
            LEFT JOIN producto_variante pv ON p.id = pv.producto_id
            LEFT JOIN linea_de_compra lc ON pv.id = lc.producto_variante_id
            LEFT JOIN compra c ON lc.compra_id = c.id AND c.estado_pago = 'confirmado'
            WHERE p.activo = TRUE
            GROUP BY p.id
            ORDER BY total_ventas DESC, p.id ASC
            LIMIT 3
        )
        SELECT p.id as producto_id, p.nombre, p.codigo, v.precio, v.imagen_url as imagen_principal
        FROM producto p
        JOIN ranked_productos rp ON p.id = rp.id
        LEFT JOIN producto_variante v ON p.id = v.producto_id
        ORDER BY rp.total_ventas DESC, p.id ASC, v.id ASC
      `;
      const result = await db.query(query);

      const grouped: Record<string, any> = {};

      for (const row of result.rows) {
        if (!grouped[row.producto_id]) {
          grouped[row.producto_id] = {
            id: row.producto_id,
            nombre: row.nombre,
            codigo: row.codigo,
            precioBase: Number(row.precio) || 0,
            imagen: row.imagen_principal && !row.imagen_principal.includes('example.com') ? row.imagen_principal : "/camisa.png",
          };
        } else if (grouped[row.producto_id].imagen === "/camisa.png") {
          const fallbackImage = row.imagen_principal && !row.imagen_principal.includes('example.com') ? row.imagen_principal : null;
          if (fallbackImage) {
            grouped[row.producto_id].imagen = fallbackImage;
          }
        }
      }

      return Object.values(grouped).slice(0, 3);
    } catch (error) {
      console.error("Error al obtener productos destacados:", error);
      return [];
    }
  }
};