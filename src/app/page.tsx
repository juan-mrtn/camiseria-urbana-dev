import ProductCard from '@/components/productos/ProductCard';

const PRODUCTOS_EJEMPLO = [
  { id: '1', nombre: 'Camisa Algodón Premium', precio: 16990, enStock: true, imagenUrl: 'https://via.placeholder.com/400x500?text=Algodon', tieneDescuento: true },
  { id: '2', nombre: 'Camisa Denim Urbana', precio: 22490, enStock: true, imagenUrl: 'https://via.placeholder.com/400x500?text=Jean', tieneDescuento: false },
  { id: '3', nombre: 'Camisa Lino Natural', precio: 18990, enStock: false, imagenUrl: 'https://via.placeholder.com/400x500?text=Lino', tieneDescuento: false },
  { id: '4', nombre: 'Camisa Oxford Clásica', precio: 15500, enStock: true, imagenUrl: 'https://via.placeholder.com/400x500?text=Oxford', tieneDescuento: true },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Título de la sección */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wider">
          Todas las Camisas <span className="text-gray-400 font-light">({PRODUCTOS_EJEMPLO.length})</span>
        </h1>
        <select className="border rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500">
          <option>Ordenar: Relevancia</option>
          <option>Precio: Menor a Mayor</option>
          <option>Precio: Mayor a Menor</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* FILTROS (Sidebar) - Según tu Entregable 2 */}
        <aside className="w-full md:w-64 shrink-0 space-y-8">
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

        {/* GRILLA DE PRODUCTOS */}
        <main className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {PRODUCTOS_EJEMPLO.map((prod) => (
              <ProductCard 
                key={prod.id}
                nombre={prod.nombre}
                precio={prod.precio}
                imageUrl={prod.imagenUrl}
                enStock={prod.enStock}
                estrellas={Math.floor(Math.random() * 5) + 1}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}