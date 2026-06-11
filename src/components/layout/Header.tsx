'use client';

import Link from "next/link";
import { Heart, User, Moon, LogOut, Package, Settings } from 'lucide-react';
import { useState, useRef, useEffect, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import SearchBar from "@/components/shop/SearchBar";

interface HeaderProps {
  cartBadge?: ReactNode;
}

export default function Header({ cartBadge }: HeaderProps) {
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
        <div className="flex-1 max-w-md hidden md:block mx-auto">
          <SearchBar />
        </div>

        {/* Acciones de Usuario */}
        <div className="flex items-center gap-4">
          <button title="Modo Oscuro" className="p-2 hover:bg-gray-100 rounded-full">
            <Moon className="w-5 h-5 text-gray-600" />
          </button>
          <Link href="/mi-cuenta/favoritos" className="p-2 hover:bg-gray-100 rounded-full relative">
            <Heart className="w-5 h-5 text-gray-600" />
          </Link>

          {/* El badge dinámico inyectado desde el servidor */}
          {cartBadge}

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
                      href="/mi-cuenta/opiniones"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Package className="w-4 h-4 mr-2" /> Mis Compras
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
                      <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Iniciar Sesión
                      </Link>
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