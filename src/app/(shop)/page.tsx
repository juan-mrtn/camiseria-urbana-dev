import { redirect } from "next/navigation";
import { ProductoRepository } from "@/repositories/producto.repository";
import ProductCard from "@/components/productos/ProductCard";
import Pagination from "@/components/ui/Pagination";
import { titleFont } from "@/config/fonts";

interface Props {
    // Definimos que searchParams es opcional (?) para calmar a TypeScript
    searchParams?: {
        page?: string;
    }
}

export default async function HomePage(props: { searchParams: Promise<{ page?: string }> }) {
    const searchParams = await props.searchParams;
    // 1. Leemos la página de la URL (si no existe, es la 1)
    const page = searchParams.page ? parseInt(searchParams.page) : 1;
    // 2. Pedimos los datos paginados
    const { productos, totalPages } = await ProductoRepository.getPaginated({ page });
    // 3. Redirección por seguridad (si ponen pagina 500 y no existe)
    if (productos.length === 0 && page > 1) {
        redirect("/");
    }

    return (
        // 2. ESTILO: Mantenemos tu contenedor original "max-w-7xl" [cite: 25]
        <div className="max-w-7xl mx-auto px-4 pt-4 py-8">

            <div className="flex justify-between items-center mb-8 border-b pb-4">

                <h1 className={`${titleFont.className} text-2xl font-bold uppercase tracking-wider text-right`}>
                    Todas las Camisas <span className="text-gray-400 font-light">({productos.length})</span>
                </h1>
                <div>
                    <select className="border rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 bg-white">
                        <option>Ordenar: Relevancia</option>
                        <option>Precio: Menor a Mayor</option>
                        <option>Precio: Mayor a Menor</option>
                    </select>
                </div>

            </div>

            <div className="flex flex-col md:flex-row gap-10">

                {/* SIDEBAR DE FILTROS (Tu diseño original estático) [cite: 26-30] */}
                <aside className="w-full md:w-64 shrink-0 space-y-8">
                    {/* Filtro Categoría */}
                    <div>
                        <h3 className="font-bold text-xs uppercase tracking-widest mb-4 border-l-4 border-indigo-600 pl-2">
                            Categoría
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            {['Algodón', 'Jean', 'Lino'].map((cat) => (
                                <li key={cat} className="flex items-center gap-2 cursor-pointer hover:text-indigo-600">
                                    <input type="checkbox" className="rounded border-gray-300" id={cat} />
                                    <label htmlFor={cat}>{cat}</label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Filtro Talle */}
                    <div>
                        <h3 className="font-bold text-xs uppercase tracking-widest mb-4 border-l-4 border-indigo-600 pl-2">
                            Talle
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                            {['S', 'M', 'L', 'XL'].map((talle) => (
                                <button key={talle} className="border py-2 text-xs font-bold hover:bg-black hover:text-white transition">
                                    {talle}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* GRILLA + PAGINACIÓN */}
                <main className="flex-1">
                    {productos.length === 0 ? (
                        <div className="alert alert-info">No hay productos.</div>
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