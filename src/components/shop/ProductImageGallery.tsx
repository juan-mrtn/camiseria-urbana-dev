"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  altText?: string;
  placeholderImage?: string;
}

export default function ProductImageGallery({ 
  images, 
  altText = "Imagen del producto",
  placeholderImage = "/camisa.png"
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Unificamos el array, asegurando que no vengan vacíos ni nulos y caemos al placeholder si es necesario
  const validImages = images?.filter((img) => typeof img === 'string' && img.trim() !== "") || [];
  const displayImages = validImages.length > 0 ? validImages : [placeholderImage];

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollPosition = scrollContainerRef.current.scrollLeft;
      const width = scrollContainerRef.current.offsetWidth;
      // Añadimos un pequeño offset al cálculo para evitar flickering en bordes
      const newIndex = Math.round(scrollPosition / width);
      setActiveIndex(newIndex);
    }
  }, []);

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: width * index,
        behavior: "smooth"
      });
      setActiveIndex(index);
    }
  };

  return (
    <div className="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden group">
      
      {/* Contenedor principal con Scroll Snap */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory"
        // Estilos en línea para ocultar la barra de scroll en navegadores que no soportan clases de Tailwind nativas para esto
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Galería de imágenes del producto"
      >
        {/* Truco para WebKit scrollbar (Chrome/Safari) */}
        <style dangerouslySetInnerHTML={{__html: `
          div::-webkit-scrollbar { display: none; }
        `}} />

        {displayImages.map((src, index) => (
          <div 
            key={`${src}-${index}`} 
            className="relative h-full w-full flex-shrink-0 snap-center"
            role="group"
            aria-roledescription="slide"
            aria-label={`Imagen ${index + 1} de ${displayImages.length}`}
          >
            <Image
              src={src}
              alt={`${altText} - Vista ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>

      {/* Flechas de Navegación (Solo se muestran en Desktop y al hacer hover) */}
      {displayImages.length > 1 && (
        <>
          <button
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            className={`absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 z-10 ${
              activeIndex === 0 ? "invisible" : "visible"
            }`}
            aria-label="Ver imagen anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => scrollToIndex(Math.min(displayImages.length - 1, activeIndex + 1))}
            className={`absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 z-10 ${
              activeIndex === displayImages.length - 1 ? "invisible" : "visible"
            }`}
            aria-label="Ver siguiente imagen"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Indicadores de Paginación (Dots) */}
      {displayImages.length > 1 && (
        <div 
          className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2 px-4 z-10" 
          role="tablist"
        >
          {displayImages.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => scrollToIndex(index)}
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={`Ir a la imagen ${index + 1}`}
              className={`transition-all duration-300 rounded-full h-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-transparent ${
                activeIndex === index 
                  ? "w-6 bg-white" 
                  : "w-2 bg-white/60 hover:bg-white/90"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
