"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Banner } from "@/repositories/banner.repository";

export default function HeroCarouselClient({ banners }: { banners: Banner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === banners.length - 1 ? 0 : prevIndex + 1));
  }, [banners.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1));
  };

  // Autoplay functionality
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Rotate every 5 seconds
    
    return () => clearInterval(interval);
  }, [nextSlide, banners.length]);

  if (!banners || banners.length === 0) return null;

  return (
    <section className="relative w-full border rounded-2xl bg-white overflow-hidden shadow-sm mt-6">
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => {
          const destinationUrl = banner.boton_texto === '/catalogo' 
            ? '/catalogo' 
            : banner.boton_texto === '/ofertas' 
              ? '/ofertas' 
              : `/coleccion/${banner.id}`;
              
          return (
          <Link 
            key={banner.id} 
            href={destinationUrl}
            className="relative w-full flex-shrink-0 h-[400px] sm:h-[500px] md:h-[600px] bg-gray-50 flex items-center justify-center group cursor-pointer overflow-hidden"
          >
            {/* Imagen de Fondo Completa (Sin Recortes) */}
            <Image 
              src={banner.imagen_url} 
              fill 
              sizes="100vw"
              className="object-contain transition-transform duration-700 group-hover:scale-[1.01]" 
              alt={banner.titulo}
              priority={currentIndex === 0}
              quality={100}
            />
            
            {/* Overlay sutil que aparece solo al pasar el mouse indicando que es clickeable */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 z-10" />
          </Link>
          );
        })}
      </div>

      {/* Flechas de Navegación */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black text-white p-2 rounded-full transition-colors z-20 backdrop-blur-sm"
            aria-label="Anterior banner"
          >
            <ChevronLeft className="w-6 h-6"/>
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black text-white p-2 rounded-full transition-colors z-20 backdrop-blur-sm"
            aria-label="Siguiente banner"
          >
            <ChevronRight className="w-6 h-6"/>
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${currentIndex === idx ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
                aria-label={`Ir al banner ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
