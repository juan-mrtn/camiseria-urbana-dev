
'use client';

import Link from "next/link";
import { Search, Heart, ShoppingCart, User, Moon, LogOut, Package, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Efecto para cerrar el menú si el usuario hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          
          {/* MENÚ DE USUARIO DESPLEGABLE */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-full focus:outline-none transition-colors"
            >
              {session?.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt="Perfil" 
                  className="w-6 h-6 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Ventanita del Dropdown */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-1 z-50">
                {session ? (
                  <>
                    {/* Info del usuario logueado */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                    </div>
                    
                    <Link 
                      href="/perfil" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" /> Mi Perfil
                    </Link>
                    
                    <Link 
                      href="/perfil/pedidos" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Package className="w-4 h-4 mr-2" /> Mis Pedidos
                    </Link>
                    
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut();
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    {/* Opciones para usuarios invitados */}
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        signIn();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Iniciar Sesión
                    </button>
                    <Link 
                      href="/register" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Crear Cuenta
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}