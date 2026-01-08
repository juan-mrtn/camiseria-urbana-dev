// src/components/productos/ProductDetail.tsx
import Image from 'next/image';
import { Heart, Truck, Star } from 'lucide-react';

interface ProductDetailProps {
  producto: {
    nombre: string;
    precio: number;
    descripcion: string;
    talles: string[];
    imagenes: string[];
    opinionesCount: number;
  }
}

export default function ProductDetail({ producto }: ProductDetailProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumbs - Según Mockup */}
      <nav className="text-sm text-gray-500 mb-6">
        Inicio &gt; Catálogo &gt; <span className="text-gray-900 font-medium">{producto.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Galería de Imágenes [cite: 1568, 1569] */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] w-full bg-gray-100 rounded-lg overflow-hidden">
            <Image src={producto.imagenes[0]} alt={producto.nombre} fill className="object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {producto.imagenes.map((img, i) => (
              <div key={i} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden border hover:border-indigo-600 cursor-pointer">
                <Image src={img} alt={`${producto.nombre} ${i}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Información de Compra [cite: 1569-1580] */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{producto.nombre}</h1>
          <p className="text-2xl font-bold text-indigo-600">${producto.precio.toLocaleString('es-AR')}</p>
          
          <div className="flex items-center gap-2 text-yellow-400">
            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            <span className="text-gray-500 text-sm">({producto.opinionesCount} opiniones)</span>
          </div>

          {/* Selector de Talle [cite: 1572-1576] */}
          <div>
            <h3 className="font-semibold mb-3">Talle</h3>
            <div className="flex gap-3">
              {producto.talles.map(talle => (
                <button key={talle} className="w-12 h-12 border-2 flex items-center justify-center font-bold hover:border-black transition">
                  {talle}
                </button>
              ))}
            </div>
          </div>

          {/* Botones de Acción [cite: 1579, 1580] */}
          <div className="flex gap-4">
            <button className="flex-1 bg-indigo-600 text-white py-4 font-bold uppercase hover:bg-indigo-700 transition">
              Agregar al carrito
            </button>
            <button className="p-4 border hover:bg-gray-50" title="Añadir a favoritos">
              <Heart className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Calculadora de Envío [cite: 1581-1583] */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Truck size={18} /> Calculadora de envío
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Tu código postal" className="flex-1 border p-2 text-sm" />
              <button className="bg-gray-800 text-white px-4 py-2 text-sm font-bold">Calcular</button>
            </div>
          </div>

          {/* Descripción [cite: 1584-1586] */}
          <div>
            <h3 className="font-bold border-b pb-2 mb-3">Descripción</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{producto.descripcion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}