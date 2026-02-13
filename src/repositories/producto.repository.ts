import { db } from "@/lib/db";

export const ProductoRepository = {
    // Ahora aceptamos opciones de paginación
    async getPaginated({ page = 1, take = 12 }: { page?: number, take?: number }) {
        // Validaciones de seguridad por si ponen ?page=texto o ?page=-5
        if (isNaN(Number(page))) page = 1;
        if (page < 1) page = 1;

        try {
            // 1. Consultar Productos (con límite)
            const productos = await db.producto.findMany({
                take: take,              // Traeme solo 12
                skip: (page - 1) * take, // Saltá los anteriores (Ej: pag 2 salta los primeros 12)
                include: {
                    variantes: {
                        take: 1,
                        include: {
                            imagenes: { take: 1 },
                            promocion: true
                        }
                    }
                }
            });

            // 2. Contar el TOTAL real de productos (para saber cuántas páginas hay)
            const totalCount = await db.producto.count();
            const totalPages = Math.ceil(totalCount / take);

            return {
                // Mapeo igual que antes
                productos: productos.map(p => {
                    const variante = p.variantes[0];
                    return {
                        id: p.id,
                        nombre: p.nombre,
                        precio: variante?.precio.toNumber() || 0,
                        imagen: variante?.imagenes[0]?.urlImagen || "/placeholder.jpg",
                        slug: p.codigo
                    };
                }),
                currentPage: page,
                totalPages: totalPages
            };

        } catch (error) {
            throw new Error("No se pudo cargar los productos");
        }
    }
};