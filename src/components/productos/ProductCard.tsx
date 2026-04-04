// src/components/productos/ProductCard.tsx
import Image from "next/image";
import Link from "next/link";

// 1. Definimos la interfaz del objeto que viene de la DB
interface Producto {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  slug: string;
  stockDisponible?: number;
}

interface Props {
  producto: Producto;
}

export default function ProductCard({ producto }: Props) {
// Lógica de stock basada en los datos de la DB
  // Si no viene el dato del stock, asumimos true para no bloquear la venta
  const enStock = producto.stockDisponible !== undefined ? producto.stockDisponible > 0 : true;
  
  // Por ahora las estrellas pueden ser fijas o venir de una columna de promedio en la vista
  const estrellas = 5;
  console.log("ProductoCard renderizado con producto:", producto.id, producto.slug);
  return (
    <div className="group border p-4 rounded-lg flex flex-col gap-2 shadow-sm hover:shadow-md transition bg-white h-full">
      {/* IMAGEN Y OVERLAY DE STOCK */}
      {/* Redirigimos al detalle usando el ID que espera tu Page Component */}
      <Link href={`/productos/${producto.id}`}>
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-gray-100">
          <Image
            src={producto.imagen || '/placeholder.jpg'} // Fallback de imagen
            alt={producto.nombre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {!enStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <span className="bg-white px-3 py-1 text-xs font-bold uppercase text-black shadow-lg">
                Sin Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* INFORMACIÓN Y ESTRELLAS */}
      <div className="mt-2 flex-grow">
        <Link href={`/productos/${producto.id}`}>
          <h3 className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {producto.nombre}
          </h3>
        </Link>

        <p className="text-lg font-bold text-indigo-600 mt-1">
          ${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
        </p>

        <div className="flex items-center gap-1 text-yellow-400 text-[10px] mt-1">
          {'★'.repeat(estrellas)}
          <span className="text-gray-400 text-xs ml-1 font-medium">({estrellas}.0)</span>
        </div>
      </div>

      {/* BOTÓN AGREGAR AL CARRITO */}
      <button
        disabled={!enStock}
        className={`mt-4 w-full py-2.5 rounded-md font-bold text-white transition text-xs uppercase tracking-wider
          ${enStock
            ? 'bg-gray-900 hover:bg-indigo-600 shadow-sm active:scale-95'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
      >
        {enStock ? 'Ver detalle' : 'Agotado'}
      </button>
    </div>
  );
}