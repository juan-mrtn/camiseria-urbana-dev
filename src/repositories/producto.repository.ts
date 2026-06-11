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

  async getPaginated({ page = 1, take = 12, filters = {} }: { page?: number; take?: number; filters?: CatalogoFilters }) {
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

      const productsQuery = `
        WITH productos_filtrados AS (
            SELECT DISTINCT producto_id
            FROM v_producto_detalle
            WHERE ${filterLogic.conds}
        ),
        paginados AS (
            SELECT pf.producto_id, v.prioridad
            FROM productos_filtrados pf
            JOIN v_catalogo_publico v ON pf.producto_id = v.producto_id
            ORDER BY v.prioridad ASC, v.producto ASC 
            LIMIT $1 OFFSET $2
        ),
        opiniones_avg AS (
            SELECT pv.producto_id, COALESCE(AVG(o.estrellas), NULL)::numeric(2,1) AS promedio_estrellas
            FROM producto_variante pv
            LEFT JOIN opinion o ON pv.id = o.producto_variante_id
            WHERE pv.producto_id IN (SELECT producto_id FROM paginados)
            GROUP BY pv.producto_id
        )
        SELECT v.*, p.prioridad, oa.promedio_estrellas
        FROM v_producto_detalle v
        INNER JOIN paginados p ON v.producto_id = p.producto_id
        LEFT JOIN opiniones_avg oa ON v.producto_id = oa.producto_id
        ORDER BY p.prioridad ASC, v.nombre ASC;
      `;

      const result = await db.query(productsQuery, [take, offset, ...filterLogic.vals]);

      const countLogic = buildConditions(1);
      const countQuery = `
        SELECT COUNT(DISTINCT producto_id) AS total 
        FROM v_producto_detalle 
        WHERE ${countLogic.conds}
      `;
      const totalCountResult = await db.query(countQuery, countLogic.vals);
      const totalCount = Number(totalCountResult.rows[0]?.total ?? 0);
      const totalPages = Math.ceil(totalCount / take);

      // 2. Agrupamos los resultados exactamente como en getById
      const grouped: Record<string, any> = {};

      for (const row of result.rows) {
        if (!grouped[row.producto_id]) {
          grouped[row.producto_id] = {
            id: row.producto_id,
            nombre: row.nombre,
            codigo: row.codigo,
            precioBase: Number(row.precio) || 0, 
            // Filtramos las URLs falsas de example.com generadas por el script de prueba
            imagenPrincipal: row.imagen_principal && !row.imagen_principal.includes('example.com') ? row.imagen_principal : (Array.isArray(row.galeria_imagenes) && row.galeria_imagenes.length > 0 && !row.galeria_imagenes[0].includes('example.com') ? row.galeria_imagenes[0] : null) || "/camisa.png",
            stockTotal: 0,
            promedio_estrellas: row.promedio_estrellas !== null ? Number(row.promedio_estrellas) : null,
            promocion: row.tipo_promocion ? {
              tipo: row.tipo_promocion,
              descuento: Number(row.valor_descuento)
            } : null,
          };
        } else if (grouped[row.producto_id].imagenPrincipal === "/camisa.png") {
          const fallbackImage = (row.imagen_principal && !row.imagen_principal.includes('example.com') ? row.imagen_principal : null) || (Array.isArray(row.galeria_imagenes) && row.galeria_imagenes.length > 0 && !row.galeria_imagenes[0].includes('example.com') ? row.galeria_imagenes[0] : null);
          if (fallbackImage) {
            grouped[row.producto_id].imagenPrincipal = fallbackImage;
          }
        }

        // Si tiene variante, parseamos su stock como en getById y lo sumamos
        if (row.variante_id) {
          const stockParseado = parseInt(row.stock_disponible as string) || 0;
          grouped[row.producto_id].stockTotal += stockParseado;
        }
      }

      // 3. Mapeamos al formato exacto que espera tu ProductCard
      const productos = Object.values(grouped).map((p: any) => {
        return {
          id: p.id,
          nombre: p.nombre,
          precio: p.precioBase,
          // ProductCard espera un array 'imagenes', así que lo metemos en uno
          imagen: p.imagenPrincipal, 
          slug: p.codigo,
          stockDisponible: p.stockTotal,
          precioBase: p.precioBase,
          promedio_estrellas: p.promedio_estrellas,
          promocion: p.promocion
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
      // Buscamos por la columna producto_id (ej: 'P01')
      const query = `SELECT * FROM v_producto_detalle WHERE producto_id = $1;`;
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
        
        return {
          id: row.variante_id,
          talle: row.talle || 'Único', 
          color: row.color || 'No especificado',
          material: row.material || 'No especificado',
          precio: Number(row.precio) || 0,
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
      
      return {
        id: base.producto_id,
        nombre: base.nombre,
        descripcion: base.descripcion,
        codigo: base.codigo,
        precioBase: Number(base.precio),
        imagenes: imagenes.length > 0 ? imagenes : ['/camisa.png'],
        variantes,
        stockTotal,
        promedio_estrellas,
        opiniones,
        opinionesCount: opiniones.length,
        promocion: base.tipo_promocion ? {
          tipo: base.tipo_promocion,
          descuento: Number(base.valor_descuento)
        } : null
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
            WHERE tipo_promocion IS NOT NULL
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
        WHERE v.tipo_promocion IS NOT NULL;
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
  }
};