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

export const ProductoRepository = {
  async getPaginated({ page = 1, take = 12 }: { page?: number; take?: number }) {
    page = Number(page);
    take = Number(take);

    if (Number.isNaN(page) || page < 1) page = 1;
    if (Number.isNaN(take) || take < 1) take = 12;

    try {
      const offset = (page - 1) * take;

      // 1. Buscamos los 12 productos base y los cruzamos con TU VISTA
      const productsQuery = `
        WITH paginados AS (
            -- 1. Traemos los 12 productos ya ordenados por tu vista
            SELECT producto_id, stock_total, prioridad
            FROM v_catalogo_publico 
            ORDER BY prioridad ASC, producto ASC 
            LIMIT $1 OFFSET $2
        )
        -- 2. Cruzamos esos 12 con v_producto_detalle para traer las fotos, precios y promos
        SELECT v.*, p.stock_total, p.prioridad
        FROM v_producto_detalle v
        INNER JOIN paginados p ON v.producto_id = p.producto_id
        ORDER BY p.prioridad ASC, v.nombre ASC;
      `;

      const result = await db.query(productsQuery, [take, offset]);

      const totalCountResult = await db.query("SELECT COUNT(*) AS total FROM producto");
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
            // Tomamos el precio de la vista
            precioBase: Number(row.precio) || 0, 
            // Guardamos la imagen principal para hacer un array luego
            imagenPrincipal: row.imagen_principal || "/placeholder.jpg",
            stockTotal: 0,
            promocion: row.tipo_promocion ? {
              tipo: row.tipo_promocion,
              descuento: Number(row.valor_descuento)
            } : null,
          };
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
      // Ahora buscamos por la columna producto_id (ej: 'P01')
      const query = `SELECT * FROM v_producto_detalle WHERE producto_id = $1;`;
      const result = await db.query(query, [productoId]);

      if (result.rows.length === 0) return null;

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

      // ... resto del mapeo igual que antes ...
      const imagenes = [
        base.imagen_principal,
        ...(Array.isArray(base.galeria_imagenes) ? base.galeria_imagenes : [])
      ].filter(Boolean);

      const stockTotal = variantes.reduce((acc, v) => acc + v.stock, 0);
      console.log("Valor parseado de 1stock:", stockTotal);
      return {
        id: base.producto_id,
        nombre: base.nombre,
        descripcion: base.descripcion,
        codigo: base.codigo,
        precioBase: Number(base.precio),
        imagenes: imagenes.length > 0 ? imagenes : ['/placeholder.jpg'],
        variantes,
        stockTotal,
        promocion: base.tipo_promocion ? {
          tipo: base.tipo_promocion,
          descuento: Number(base.valor_descuento)
        } : null
      };
    } catch (error) {
      console.error(error);
      throw new Error("Error al obtener producto por ID");
    }
  }


};