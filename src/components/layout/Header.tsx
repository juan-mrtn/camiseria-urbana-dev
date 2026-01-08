import Link from "next/link";
import { Search, Heart, ShoppingCart, User, Moon} from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo según Mockup */}
        <Link href="/" className="font-bold text-xl tracking-tighter">
          LA CAMISERÍA <span className="text-indigo-600">URBANA</span>
        </Link>

        {/* Buscador (PBI-07) */}
        <div className="flex-1 max-w-md relative hidden sm:block">
          <input 
            type="text" 
            placeholder="Buscar camisas, materiales o colecciones..." 
            className="w-full border rounded-full py-2 px-4 pl-10 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        </div>

        {/* Acciones de Usuario */}
        <div className="flex items-center gap-4">
          <button title="Modo Oscuro" className="p-2 hover:bg-gray-100 rounded-full">
            <Moon className="w-5 h-5 text-gray-600" />
          </button>
          <Link href="/perfil/favoritos" className="p-2 hover:bg-gray-100 rounded-full relative">
            <Heart className="w-5 h-5 text-gray-600" />
          </Link>
          <Link href="/carrito" className="p-2 hover:bg-gray-100 rounded-full relative">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 rounded-full">3</span>
          </Link>
          <Link href="/perfil" className="p-2 hover:bg-gray-100 rounded-full">
            <User className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </div>
    </header>
  );
}