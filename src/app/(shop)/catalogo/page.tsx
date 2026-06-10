import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ProductoRepository } from "@/repositories/producto.repository";
import ProductCard from "@/components/productos/ProductCard";
import Pagination from "@/components/ui/Pagination";
import { titleFont } from "@/config/fonts";
import FilterSidebar from "@/components/shop/FilterSidebar";

export default async function HomePage(props: {
    searchParams: Promise<{
        page?: string;
        color?: string;
        talle?: string;
        material?: string;
        precio_min?: string;
        precio_max?: string;
        q?: string;
    }>
}) {
    const searchParams = await props.searchParams;
    // 1. Leemos la página de la URL (si no existe, es la 1)
    const page = searchParams.page ? parseInt(searchParams.page) : 1;

    // Filtros dinámicos desde la URL
    const filters = {
        color: searchParams.color,
        talle: searchParams.talle,
        material: searchParams.material,
        precio_min: searchParams.precio_min ? Number(searchParams.precio_min) : undefined,
        precio_max: searchParams.precio_max ? Number(searchParams.precio_max) : undefined,
        search: searchParams.q,
    };

    // 2. Pedimos los datos paginados y las opciones de filtros dinámicos
    const [paginatedData, filterOptions] = await Promise.all([
        ProductoRepository.getPaginated({ page, filters }),
        ProductoRepository.getAvailableFilterOptions()
    ]);
    const { productos, totalPages } = paginatedData;
    const { talles, materiales } = filterOptions;

    // 3. Redirección por seguridad (si ponen pagina 500 y no existe)
    if (productos.length === 0 && page > 1) {
        redirect("/catalogo");
    }

    return (
        <div className="max-w-7xl mx-auto px-4 pt-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b pb-4">
                <h1 className={`${titleFont.className} text-2xl font-bold uppercase tracking-wider text-right`}>
                    Catálogo <span className="text-gray-400 font-light">({page})</span>
                </h1>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <select className="border rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 bg-white">
                        <option>Ordenar: Relevancia</option>
                        <option>Precio: Menor a Mayor</option>
                        <option>Precio: Mayor a Menor</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-10">
                {/* SIDEBAR DE FILTROS */}
                <Suspense fallback={
                    <div className="w-full md:w-64 shrink-0 space-y-8 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-32 bg-gray-100 rounded mb-8"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-24 bg-gray-100 rounded mb-8"></div>
                    </div>
                }>
                    <FilterSidebar talles={talles} materiales={materiales} />
                </Suspense>

                {/* GRILLA + PAGINACIÓN */}
                <main className="flex-1">
                    {productos.length === 0 ? (
                        <div className="alert alert-info">No se encontraron productos que coincidan con los filtros.</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                                {productos.map((prod) => (
                                    <ProductCard key={prod.id} producto={prod} />
                                ))}
                            </div>

                            {/*componente de paginación*/}
                            <Pagination totalPages={totalPages} />
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}