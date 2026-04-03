import { db } from "@/lib/db";

type ProductRow = {
  id: string;
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
};