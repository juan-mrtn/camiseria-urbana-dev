import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Shirt, Layers, Wind, Percent, ShoppingCart } from "lucide-react";

// Datos de prueba (Mocks) para renderizar la vista antes de conectarla a PostgreSQL
const productosDestacados = [
  { id: 1, nombre: "Camisa Algodón Clásica", precio: 16990, enStock: true, imagen: "/images/Gemini_Generated_blanqui.png", estrellas: 4 },
  { id: 2, nombre: "Camisa Denim Premium", precio: 22490, enStock: true, imagen: "/images/Gemini_Generated_Image_azul.png", estrellas: 5 },
  { id: 3, nombre: "Camisa Lino Natural", precio: 18990, enStock: false, imagen: "/images/Gemini_Generated_Image_gris.png", estrellas: 3 },
];

const ofertasEspeciales = [
  { id: 4, nombre: "Pack Remeras Básicas", precio: 13990, precioAnterior: 19990, descuento: 30, imagen: "/images/Gemini_Generated_Image_blanca.png" },
  { id: 5, nombre: "Camisa Estampada", precio: 19990, precioAnterior: 24990, descuento: 20, imagen: "/images/Gemini_Generated_Image_cuadrille.png" },
  { id: 6, nombre: "Remeras Playboy Vintage", precio: 18690, precioAnterior: 21990, descuento: 15, imagen: "/images/Gemini_Generated_Image_motivo.png" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 pb-16">
      
      {/* 1. HERO SECTION (Banner principal) */}
      <section className="relative w-full border rounded-2xl bg-white overflow-hidden shadow-sm flex flex-col md:flex-row items-center mt-6">
        {/* Contenido Izquierda */}
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 p-8 md:p-12 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
            Promo 2x1 en la nueva colección
          </h1>
          <p className="text-lg text-gray-700">
            Aprovechá por tiempo limitado. Camisas premium en algodón, jean y lino.
          </p>
          <Link 
            href="/productos" 
            className="mt-4 bg-[#6A0DAD] hover:bg-[#580b91] text-white px-6 py-3 rounded-lg font-medium w-max flex items-center transition-colors"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Ver Colección
          </Link>
        </div>
        
        {/* Imagen Derecha */}
        <div className="w-full md:w-1/2 relative h-64 md:h-[400px] bg-[#e6eee8]">
          {/* Se usa una imagen de tu carpeta public/images como placeholder */}
          <Image 
            src="/images/Gemini_Generated_Image_verde.png" 
            fill 
            className="object-cover" 
            alt="Nueva Colección"
            priority
          />
        </div>

        {/* Flechas de Navegación (Decorativas) */}
        <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-black text-white p-1.5 rounded-full hover:bg-gray-800 transition">
          <ChevronLeft className="w-5 h-5"/>
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-black text-white p-1.5 rounded-full hover:bg-gray-800 transition">
          <ChevronRight className="w-5 h-5"/>
        </button>
      </section>

      {/* 2. CATEGORÍAS (Filtros rápidos) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { nombre: "Algodón", icono: Shirt },
          { nombre: "Jean", icono: Layers },
          { nombre: "Lino", icono: Wind },
          { nombre: "Ofertas", icono: Percent },
        ].map((cat, i) => (
          <Link key={i} href={`/categoria/${cat.nombre.toLowerCase()}`} className="bg-gray-100 hover:bg-gray-200 transition-colors py-4 rounded-xl flex items-center justify-center font-medium text-gray-800 shadow-sm border border-gray-50">
            <cat.icono className="w-5 h-5 mr-2 text-gray-600" /> 
            {cat.nombre}
          </Link>
        ))}
      </section>

      {/* 3. PRODUCTOS DESTACADOS */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Productos destacados</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {productosDestacados.map((prod) => (
            <div key={prod.id} className="border p-4 rounded-xl flex flex-col gap-3 shadow-sm bg-white hover:shadow-md transition">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                <Image src={prod.imagen} alt={prod.nombre} fill className="object-cover" />
              </div>
              <div className="flex justify-between items-start mt-2">
                <h3 className="font-semibold text-gray-800 text-base">{prod.nombre}</h3>
                <div className="flex text-gray-400 text-xs">
                  <span className="text-yellow-400 tracking-widest">{'★'.repeat(prod.estrellas)}</span>
                  <span>{'☆'.repeat(5 - prod.estrellas)}</span>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">${prod.precio.toLocaleString('es-AR')}</p>
              
              <button 
                disabled={!prod.enStock}
                className={`w-full py-2.5 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors
                  ${prod.enStock 
                    ? 'bg-[#6A0DAD] hover:bg-[#580b91] text-white' 
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed border'}`}
              >
                {prod.enStock && <ShoppingCart className="w-4 h-4" />}
                {prod.enStock ? 'Agregar al carrito' : 'Sin stock'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. OFERTAS ESPECIALES */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Ofertas especiales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ofertasEspeciales.map((oferta) => (
            <div key={oferta.id} className="border p-4 rounded-xl flex flex-col gap-3 shadow-sm bg-white hover:shadow-md transition">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                <Image src={oferta.imagen} alt={oferta.nombre} fill className="object-cover" />
                {/* Etiqueta Naranja de Descuento */}
                <div className="absolute bottom-0 left-0 w-full bg-[#f08d49] text-white text-sm font-bold py-1.5 px-3 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" /> -{oferta.descuento}%
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-800 text-base mt-2">{oferta.nombre}</h3>
              
              <div className="flex items-center gap-3">
                <span className="text-gray-400 line-through text-sm">${oferta.precioAnterior.toLocaleString('es-AR')}</span>
                <span className="text-lg font-bold text-gray-900">${oferta.precio.toLocaleString('es-AR')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. BOTÓN CENTRAL - VER CATÁLOGO */}
      <div className="flex justify-center mt-4">
        <Link 
          href="/catalogo" 
          className="bg-[#6A0DAD] hover:bg-[#580b91] text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-sm"
        >
          Ver el catálogo
        </Link>
      </div>

    </div>
  );
}