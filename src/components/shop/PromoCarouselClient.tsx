"use client";

import Image from "next/image";
import Link from "next/link";
import { Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export default function PromoCarouselClient({ productos }: { productos: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!productos || productos.length === 0) return null;

  return (
    <section className="w-full bg-violet-600 py-12 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex justify-between items-end relative z-10">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Tag className="w-8 h-8 text-yellow-300" />
            Ofertas por Tiempo Limitado
          </h2>
          <p className="text-violet-200 mt-2 font-medium">
            Descuentos exclusivos en nuestras mejores prendas
          </p>
        </div>
        <Link
          href="/ofertas"
          className="hidden sm:inline-block bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full font-bold transition-colors backdrop-blur-sm border border-white/20"
        >
          Ver todo
        </Link>
      </div>

      <div className="max-w-7xl mx-auto relative group">
        {/* Flechas de Navegación (Desktop) */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 bg-white text-violet-900 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 hover:scale-110 transition-all border border-gray-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 bg-white text-violet-900 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 hover:scale-110 transition-all border border-gray-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Contenedor del Carrusel */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 pb-8 px-4 sm:px-6 lg:px-8 snap-x snap-mandatory scrollbar-none"
        >
          {productos.map((producto: any) => (
            <Link
              key={producto.id}
              href={`/productos/${producto.id}`}
              className="flex-none w-[280px] sm:w-[320px] bg-white rounded-2xl overflow-hidden snap-start shadow-xl hover:shadow-2xl transition-all group/card border border-gray-100 flex flex-col"
            >
              {/* Contenedor Imagen con Aspect 4/5 */}
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                <Image
                  src={producto.imagen}
                  alt={producto.nombre}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                />

                {/* Badge de Descuento */}
                {producto.promocion?.tipo?.toLowerCase() === 'descuento' && (
                  <div className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-1.5 rounded-sm font-black text-sm shadow-xl">
                    {/* Renderizamos el valor asumiendo que ya viene calculado o es un número entero como 15 o 20 */}
                    -{producto.promocion.descuento}% OFF
                  </div>
                )}
                {producto.promocion?.tipo === '2x1' && (
                  <div className="absolute top-4 right-4 bg-indigo-500 text-white px-3 py-1.5 rounded-sm font-black text-sm shadow-xl">
                    2x1
                  </div>
                )}
              </div>

              {/* Contenedor Info */}
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 line-clamp-1">{producto.codigo}</p>
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover/card:text-violet-600 transition-colors flex-1">
                  {producto.nombre}
                </h3>

                <div className="flex items-end gap-3 mt-4 pt-4 border-t border-gray-100">
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

      {/* Botón Ver Todo Mobile */}
      <div className="px-4 mt-2 sm:hidden text-center relative z-10">
        <Link
          href="/ofertas"
          className="inline-block bg-white/20 hover:bg-white/30 text-white w-full py-3 rounded-xl font-bold transition-colors backdrop-blur-sm border border-white/20"
        >
          Ver todas las ofertas
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
}
