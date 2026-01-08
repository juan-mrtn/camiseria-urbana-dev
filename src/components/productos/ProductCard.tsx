import Image from "next/image";

interface ProductProps {
    nombre: string;
    precio: number;
    imageUrl: string;
    enStock: boolean;
    estrellas: number;
}

export default function ProductCard({ nombre, precio, imageUrl, enStock, estrellas }: ProductProps) {
  return (
    <div className="border p-4 rounded-lg flex flex-col gap-2 shadow-sm hover:shadow-md transition">
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-gray-100">
        <Image 
          src={imageUrl} 
          alt={nombre} 
          fill 
          className="object-cover"
        />
        {!enStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white px-3 py-1 text-xs font-bold uppercase">Sin Stock</span>
          </div>
        )}
      </div>
      
      <div className="mt-2">
        <h3 className="text-sm font-medium text-gray-700">{nombre}</h3>
        <p className="text-lg font-bold text-gray-900">${precio.toLocaleString('es-AR')}</p>
        <div className="flex text-yellow-400 text-xs">
          {'★'.repeat(estrellas)}{'☆'.repeat(5 - estrellas)}
        </div>
      </div>

      <button 
        disabled={!enStock}
        className={`mt-4 w-full py-2 rounded-md font-semibold text-white transition
          ${enStock ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'}`}
      >
        {enStock ? 'Agregar al carrito' : 'No disponible'}
      </button>
    </div>
  );
}