import ProductCard from "@/components/productos/ProductCard";

export default function CatalogoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
      {/* Sidebar de Filtros - [cite: 1370] */}
      <aside className="w-64 hidden md:block">
        <h2 className="font-bold text-xl mb-4 uppercase border-b pb-2">Filtrar por</h2>
        
        <section className="mb-6">
          <h3 className="font-semibold mb-2 italic">Categoría</h3>
          <ul className="space-y-1 text-sm">
            <li><input type="checkbox" id="algodon" /> <label htmlFor="algodon">Algodón</label></li>
            <li><input type="checkbox" id="jean" /> <label htmlFor="jean">Jean</label></li>
            <li><input type="checkbox" id="lino" /> <label htmlFor="lino">Lino</label></li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="font-semibold mb-2 italic">Talle</h3>
          <div className="flex gap-2">
            {['S', 'M', 'L', 'XL'].map(talle => (
              <button key={talle} className="border px-2 py-1 text-xs hover:bg-black hover:text-white">
                {talle}
              </button>
            ))}
          </div>
        </section>
      </aside>

      {/* Grilla de Productos - [cite: 1407] */}
      <main className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold uppercase">Todas las Camisas</h1>
          <select className="border p-1 text-sm">
            <option>Ordenar: Relevancia</option>
            <option>Precio: Menor a Mayor</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Aquí mapearás los productos de tu DB más adelante */}
          <ProductCard 
            nombre="Camisa Algodón Premium Blanco" 
            precio={16990} 
            imageUrl="/path-to-image.jpg" 
            enStock={true} 
            estrellas={5} 
          />
          <ProductCard 
            nombre="Camisa Lino Natural" 
            precio={18990} 
            imageUrl="/path-to-image.jpg" 
            enStock={false} 
            estrellas={4} 
          />
        </div>
      </main>
    </div>
  );
}