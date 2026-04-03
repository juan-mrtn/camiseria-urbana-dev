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
}

interface Props {
  producto: Producto;
}

export default function ProductCard({ producto }: Props) {
  // Valores por defecto (mientras conectamos esto a la DB real más adelante)
  const enStock = true;
  const estrellas = 4; // O Math.floor(Math.random() * 5) + 1 para variar

  return (
    <div className="border p-4 rounded-lg flex flex-col gap-2 shadow-sm hover:shadow-md transition bg-white">
      {/* IMAGEN Y OVERLAY DE STOCK */}
      <Link href={`/productos/${producto.id}`}>
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-gray-100">
          <Image
            src={`${producto.imagen}`}
            alt={producto.nombre}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {!enStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white px-3 py-1 text-xs font-bold uppercase">Sin Stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* INFORMACIÓN Y ESTRELLAS */}
      <div className="mt-2">
        <Link href={`/productos/${producto.id}`}>
          <h3 className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
            {producto.nombre}
          </h3>
        </Link>

        <p className="text-lg font-bold text-gray-900">
          ${producto.precio.toLocaleString('es-AR')}
        </p>

        {/* Renderizado de Estrellas (Estilo recuperado) */}
        <div className="flex text-yellow-400 text-xs mt-1">
          {'★'.repeat(estrellas)}
          {'☆'.repeat(5 - estrellas)}
          <span className="text-gray-400 ml-1">({estrellas})</span>
        </div>
      </div>

      {/* BOTÓN AGREGAR AL CARRITO (Estilo recuperado) */}
      <button
        disabled={!enStock}
        className={`mt-4 w-full py-2 rounded-md font-semibold text-white transition text-sm uppercase tracking-wide
          ${enStock
            ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            : 'bg-gray-300 cursor-not-allowed'
          }`}
      >
        {enStock ? 'Agregar al carrito' : 'No disponible'}
      </button>
    </div>
  );
}