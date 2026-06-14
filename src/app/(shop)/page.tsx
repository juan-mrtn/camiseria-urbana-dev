// src/app/(shop)/page.tsx
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Shirt, Layers, Wind, Percent } from "lucide-react";
import { ProductoRepository } from "@/repositories/producto.repository";
import PromoCarousel from "@/components/shop/PromoCarousel";
import HeroCarouselClient from "@/components/shop/HeroCarouselClient";
import { BannerRepository } from "@/repositories/banner.repository";

export default async function HomePage() {
  // Obtenemos los 3 productos destacados reales desde la Base de Datos
  const destacados = await ProductoRepository.obtenerProductosDestacados();
  
  // Obtenemos los Banners Activos
  const banners = await BannerRepository.getActiveBanners();

  return (
    <div className="flex flex-col gap-12 pb-16">
      
      {/* 1. HERO SECTION (Banner principal) */}
      <HeroCarouselClient banners={banners} />

      {/* 2. CATEGORÍAS (Filtros rápidos interactivos) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href={`/catalogo?material=algodon`} className="bg-gray-100 hover:bg-gray-200 transition-colors py-4 rounded-xl flex items-center justify-center font-medium text-gray-800 shadow-sm border border-gray-50">
          <Shirt className="w-5 h-5 mr-2 text-gray-600" /> 
          Algodón
        </Link>
        <Link href={`/catalogo?material=jean`} className="bg-gray-100 hover:bg-gray-200 transition-colors py-4 rounded-xl flex items-center justify-center font-medium text-gray-800 shadow-sm border border-gray-50">
          <Layers className="w-5 h-5 mr-2 text-gray-600" /> 
          Jean
        </Link>
        <Link href={`/catalogo?material=lino`} className="bg-gray-100 hover:bg-gray-200 transition-colors py-4 rounded-xl flex items-center justify-center font-medium text-gray-800 shadow-sm border border-gray-50">
          <Wind className="w-5 h-5 mr-2 text-gray-600" /> 
          Lino
        </Link>
        <Link href={`/ofertas`} className="bg-gray-100 hover:bg-gray-200 transition-colors py-4 rounded-xl flex items-center justify-center font-medium text-gray-800 shadow-sm border border-gray-50">
          <Percent className="w-5 h-5 mr-2 text-red-600" /> 
          Ofertas
        </Link>
      </section>

      {/* 3. PRODUCTOS DESTACADOS DINÁMICOS */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Productos destacados</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {destacados.map((prod) => (
            <div key={prod.id} className="border p-4 rounded-xl flex flex-col gap-3 shadow-sm bg-white hover:shadow-md transition">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                <Image src={prod.imagen || "/camisa.png"} alt={prod.nombre} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex justify-between items-start mt-2">
                <h3 className="font-semibold text-gray-800 text-base">{prod.nombre}</h3>
                <div className="flex text-gray-400 text-xs">
                  <span className="text-yellow-400 tracking-widest">{'★'.repeat(5)}</span>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">${prod.precioBase?.toLocaleString('es-AR')}</p>
              
              <Link 
                href={`/productos/${prod.id}`}
                className="w-full py-2.5 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors bg-[#6A0DAD] hover:bg-[#580b91] text-white mt-auto"
              >
                <Shirt className="w-4 h-4" />
                Ver producto
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4. OFERTAS ESPECIALES DINÁMICAS (CARRUSEL) */}
      <PromoCarousel />

      {/* 5. BOTÓN CENTRAL - VER CATÁLOGO */}
      <div className="flex justify-center mt-4">
        <Link 
          href="/catalogo" 
          className="bg-[#6A0DAD] hover:bg-[#580b91] text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-sm"
        >
          Ver el catálogo completo
        </Link>
      </div>

    </div>
  );
}