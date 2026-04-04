// src/app/(shop)/catalogo/page.tsx
import ProductCard from "@/components/productos/ProductCard";
import { ProductoRepository } from "@/repositories/producto.repository";

interface Props {
  searchParams: {
    page?: string;
    take?: string;
  };
}

export default async function CatalogoPage({ searchParams }: Props) {
  // 1. Obtenemos los parámetros de paginación de la URL (o valores por defecto)
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const take = searchParams.take ? Number(searchParams.take) : 12;

  // 2. Llamamos al repositorio para traer los productos reales de la DB
  const { productos, totalPages, currentPage } = await ProductoRepository.getPaginated({
    page,
    take,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
      {/* Sidebar de Filtros (Estructura recuperada) */}
      <aside className="w-64 hidden md:block">
        <h2 className="font-bold text-xl mb-4 uppercase border-b pb-2 tracking-tighter">Filtrar por</h2>
        
        <section className="mb-6">
          <h3 className="font-semibold mb-2 italic text-sm">Categoría</h3>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2">
              <input type="checkbox" id="algodon" className="rounded border-gray-300" /> 
              <label htmlFor="algodon" className="cursor-pointer hover:text-indigo-600">Algodón</label>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" id="jean" className="rounded border-gray-300" /> 
              <label htmlFor="jean" className="cursor-pointer hover:text-indigo-600">Jean</label>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" id="lino" className="rounded border-gray-300" /> 
              <label htmlFor="lino" className="cursor-pointer hover:text-indigo-600">Lino</label>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="font-semibold mb-2 italic text-sm">Talle</h3>
          <div className="flex flex-wrap gap-2">
            {['S', 'M', 'L', 'XL'].map(talle => (
              <button key={talle} className="border w-8 h-8 text-[10px] font-bold hover:bg-black hover:text-white transition-colors">
                {talle}
              </button>
            ))}
          </div>
        </section>
      </aside>

      {/* Grilla de Productos */}
      <main className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">Todas las Camisas</h1>
            <p className="text-gray-500 text-xs mt-1">Mostrando página {currentPage} de {totalPages}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase font-semibold">Ordenar por:</span>
            <select className="border-none bg-transparent text-sm font-bold focus:ring-0 cursor-pointer">
              <option>Relevancia</option>
              <option>Precio: Menor a Mayor</option>
              <option>Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        {/* Mapeo dinámico de productos desde la base de datos */}
        {productos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {productos.map((producto) => (
              <ProductCard 
                key={producto.id}
                producto={producto} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed">
            <p className="text-gray-500 italic">No se encontraron camisas en el catálogo.</p>
          </div>
        )}

        {/* Aquí podrías insertar tu componente de Pagination más adelante */}
      </main>
    </div>
  );
}