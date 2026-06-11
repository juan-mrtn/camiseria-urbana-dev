import { BannerRepository } from "@/repositories/banner.repository";
import { ProductoRepository } from "@/repositories/producto.repository";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import FilterSidebar from "@/components/shop/FilterSidebar";
import ProductCard from "@/components/productos/ProductCard";
import { titleFont } from "@/config/fonts";

export default async function ColeccionPage(props: { params: Promise<{ banner_id: string }> }) {
  const params = await props.params;
  const bannerId = params.banner_id;
  
  // Validamos si es el UUID válido o redireccionamos
  const banner = await BannerRepository.getBannerById(bannerId).catch((err) => { console.error(err); return null; });
  
  if (!banner) {
    notFound();
  }

  const rawProductos = await BannerRepository.getBannerProducts(bannerId);
  // Adapt to ProductCard interface
  const productos = rawProductos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    precio: p.precioCalculado,
    imagen: p.imagen || "/camisa.png",
    slug: p.codigo,
  }));

  const filterOptions = await ProductoRepository.getAvailableFilterOptions();
  const { talles, materiales } = filterOptions;

  return (
    <div className="pb-20">
      {/* Header de la colección inspirado en el banner */}
      <div className="relative w-full h-[40vh] md:h-[50vh] min-h-[300px] bg-gray-900 overflow-hidden mb-8">
        <Image 
          src={banner.imagen_url}
          alt={banner.titulo}
          fill
          sizes="100vw"
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10 bg-black/30">
          <span className="text-white/80 font-bold tracking-widest uppercase text-sm mb-3">Colección Especial</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight shadow-sm">
            {banner.titulo}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl shadow-sm">
            {banner.subtitulo}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b pb-4">
          <h1 className={`${titleFont.className} text-2xl font-bold uppercase tracking-wider text-right`}>
            {banner.titulo} <span className="text-gray-400 font-light">({productos.length})</span>
          </h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Link href="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Volver al Inicio
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* SIDEBAR DE FILTROS */}
          <Suspense fallback={
              <div className="w-full md:w-64 shrink-0 space-y-8 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-32 bg-gray-100 rounded mb-8"></div>
              </div>
          }>
              <FilterSidebar talles={talles} materiales={materiales} />
          </Suspense>

          {/* GRILLA */}
          <main className="flex-1">
            {productos.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xl text-gray-500 font-medium">No hay productos asignados a esta colección aún.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {productos.map((prod) => (
                  <ProductCard key={prod.id} producto={prod} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
