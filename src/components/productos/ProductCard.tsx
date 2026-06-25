// src/components/productos/ProductCard.tsx
import { LinkIcon } from "lucide-react";
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
  promedio_estrellas?: number | null;
  precioBase?: number;
  precioFinal?: number;
  promocionActiva?: boolean;
  promocion?: {
    tipo: string;
    descuento: number;
  };
  isCombo?: boolean;
}

interface Props {
  producto: Producto;
}

export default function ProductCard({ producto }: Props) {
  // Lógica de stock basada en los datos de la DB
  // Si no viene el dato del stock, asumimos true para no bloquear la venta
  const enStock = producto.stockDisponible !== undefined ? producto.stockDisponible > 0 : true;

  // Calcula las estrellas activas usando el promedio real de la DB, con fallback a 5
  const activeStars = producto.promedio_estrellas !== null && producto.promedio_estrellas !== undefined
    ? Math.round(producto.promedio_estrellas)
    : 5;

  const isCombo = producto.isCombo;
  const linkHref = isCombo ? `/combos/${producto.id}` : `/productos/${producto.id}`;

  return (
    <div className={`group border p-4 rounded-lg flex flex-col gap-2 shadow-sm hover:shadow-md transition bg-white h-full ${isCombo ? 'border-purple-200 shadow-purple-100' : ''}`}>
      {/* IMAGEN Y OVERLAY DE STOCK */}
      {/* Redirigimos al detalle usando el ID que espera tu Page Component */}
      <Link href={linkHref}>
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-gray-100">
          <Image
            src={producto.imagen || '/placeholder.jpg'} // Fallback de imagen
            alt={producto.nombre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {isCombo && (
            <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md z-20">
              PACK COMBO
            </div>
          )}
          {producto.promocionActiva && producto.promocion && !isCombo && (
            <div className="absolute top-2 right-2 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md z-10">
              {producto.promocion.tipo === '2x1' ? '2x1' : `-${producto.promocion.descuento}% OFF`}
            </div>
          )}
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
        <Link href={linkHref}>
          <h3 className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {producto.nombre}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-lg font-bold text-indigo-600">
            ${(producto.precioFinal ?? producto.precio).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
          </p>
          {producto.promocionActiva && producto.precioBase && (
            <p className="text-sm font-medium text-gray-400 line-through">
              ${producto.precioBase.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 text-[10px] mt-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`text-base ${i < activeStars ? "text-yellow-400" : "text-gray-300"}`}>
              ★
            </span>
          ))}
          <span className="text-gray-400 text-xs ml-1 font-medium">
            ({producto.promedio_estrellas !== null && producto.promedio_estrellas !== undefined ? producto.promedio_estrellas.toFixed(1) : "5.0"})
          </span>
        </div>
      </div>

      {/* BOTÓN AGREGAR AL CARRITO */}
      <Link href={linkHref}>
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
      </Link>
    </div>
  );
}