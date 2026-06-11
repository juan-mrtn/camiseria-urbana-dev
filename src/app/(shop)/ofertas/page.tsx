// src/app/(shop)/ofertas/page.tsx
import { ProductoRepository } from "@/repositories/producto.repository";
import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ofertas y Promociones Especiales",
  description: "Descubre nuestras promociones especiales y descuentos por tiempo limitado.",
};

export default async function OfertasPage() {
  const productos = await ProductoRepository.getProductosEnPromocion();

  if (!productos || productos.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center">
        <Tag className="w-20 h-20 text-gray-300 mb-6" />
        <h1 className="text-3xl font-black text-gray-900 mb-4">No hay ofertas disponibles</h1>
        <p className="text-gray-500 mb-8">Actualmente no tenemos promociones activas. ¡Vuelve pronto!</p>
        <Link href="/catalogo" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition">
          Ver Catálogo Completo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-4 flex justify-center items-center gap-3">
          <Tag className="w-10 h-10 text-violet-600" />
          Ofertas Exclusivas
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Aprovecha estas promociones por tiempo limitado y llévate tus prendas favoritas al mejor precio.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {productos.map((producto: any) => (
          <Link 
            key={producto.id} 
            href={`/productos/${producto.id}`}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-gray-200 flex flex-col"
          >
            {/* Contenedor Imagen */}
            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
              <Image 
                src={producto.imagen} 
                alt={producto.nombre} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {producto.promocion?.tipo?.toLowerCase() === 'descuento' && (
                  <span className="bg-red-500 text-white px-3 py-1.5 rounded-full font-black text-sm shadow-md">
                    -{producto.promocion.descuento}% OFF
                  </span>
                )}
                {producto.promocion?.tipo === '2x1' && (
                  <span className="bg-indigo-500 text-white px-3 py-1.5 rounded-full font-black text-sm shadow-md">
                    2x1
                  </span>
                )}
              </div>
            </div>

            {/* Contenedor Info */}
            <div className="p-5 flex flex-col flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{producto.codigo}</p>
              <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-violet-600 transition-colors flex-1">
                {producto.nombre}
              </h3>
              
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                {producto.precioBase > producto.precioCalculado && (
                  <p className="text-gray-400 line-through text-sm">
                    ${producto.precioBase.toLocaleString('es-AR')}
                  </p>
                )}
                <p className="text-green-600 font-bold text-lg">
                  ${producto.precioCalculado.toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
