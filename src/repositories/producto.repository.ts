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

      const productsQuery = `
        WITH paginated_productos AS (
          SELECT id, nombre, codigo
          FROM producto
          ORDER BY nombre
          LIMIT $1 OFFSET $2
        )
        SELECT p.id, p.nombre, p.codigo,
               pv.id AS variante_id,
               pv.precio,
               pv.imagen_url AS url_imagen
        FROM paginated_productos p
        LEFT JOIN producto_variante pv ON pv.producto_id = p.id
        LEFT JOIN imagen img ON img.producto_variante_id = pv.id
        ORDER BY p.nombre
      `;

      const result = await db.query(productsQuery, [take, offset]);

      const totalCountResult = await db.query("SELECT COUNT(*) AS total FROM producto");
      const totalCount = Number(totalCountResult.rows[0]?.total ?? 0);
      const totalPages = Math.ceil(totalCount / take);

      const grouped: Record<string, any> = {};

      for (const row of result.rows as ProductRow[]) {
        if (!grouped[row.id]) {
          grouped[row.id] = {
            id: row.id,
            nombre: row.nombre,
            codigo: row.codigo,
            variantes: [],
          };
        }

        if (row.variante_id) {
          grouped[row.id].variantes.push({
            id: row.variante_id,
            precio: row.precio ?? 0,
            imagen: row.url_imagen,
          });
        }
      }

      const productos = Object.values(grouped).map((p: any) => {
        const variante = p.variantes[0];
        return {
          id: p.id,
          nombre: p.nombre,
          precio: variante?.precio ?? 0,
          imagen: variante?.imagen ?? "/placeholder.jpg",
          slug: p.codigo,
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
        // Mapeo seguro del stock que ahora viene de tu v_stock_actual
        console.log("Valor raw de stock_disponible:", row.stock_disponible);
        const stockParseado = parseInt(row.stock_disponible as string) || 0;
        console.log("Valor parseado de stock:", stockParseado);
        
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