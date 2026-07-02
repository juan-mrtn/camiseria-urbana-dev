'use client';

import Link from "next/link";
import { Heart, User, Moon, LogOut, Package, Settings, Star, LayoutDashboard } from 'lucide-react';
import { useState, useRef, useEffect, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
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
    <header className="bg-white sticky top-0 z-180 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo según Mockup */}
        <Link href="/" className="font-bold text-3xl tracking-tighter">
          LA CAMISERÍA <span className="text-[#2D4B1B]">URBANA</span>
        </Link>

        {/* Buscador (PBI-07) */}
        <div className="flex-1 max-w-lg hidden md:block mx-auto">
          <SearchBar />
        </div>

        {/* Acciones de Usuario */}
        <div className="flex items-center gap-3">
          <Link href="/mi-cuenta/favoritos" className="p-1.5 hover:bg-gray-100 rounded-full relative">
            <Heart className="w-6 h-6 text-gray-700" />
          </Link>

          {/* El badge dinámico inyectado desde el servidor */}
          {cartBadge}

          {/* MENÚ DE USUARIO DESPLEGABLE */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 hover:bg-gray-100 rounded-full focus:outline-none transition-colors"
            >
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Perfil"
                  className="w-7 h-7 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-7 h-7 text-gray-600" />
              )}
            </button>

            {/* Ventanita del Dropdown */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 overflow-hidden"
                >
                  {session ? (
                    <>
                      {/* Info del usuario logueado */}
                      <div className="px-4 py-3 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                      </div>

                      {/* Admin Dashboard Link */}
                      {session?.user?.rol === 'admin' && (
                        <>
                          <Link
                            href="/dashboard"
                            className="flex items-center mx-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#31572C]/10 hover:text-[#31572C] rounded-md transition-colors duration-150"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4 mr-2" /> Panel de Control
                          </Link>
                          <div className="h-px bg-gray-100 my-1 mx-4"></div>
                        </>
                      )}

                      <Link
                        href="/perfil"
                        className="flex items-center mx-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#31572C]/10 hover:text-[#31572C] rounded-md transition-colors duration-150"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" /> Mi Perfil
                      </Link>

                      <Link
                        href="/compras"
                        className="flex items-center mx-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#31572C]/10 hover:text-[#31572C] rounded-md transition-colors duration-150"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Package className="w-4 h-4 mr-2" /> Mis Compras
                      </Link>

                      <Link
                        href="/mi-cuenta/opiniones"
                        className="flex items-center mx-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#31572C]/10 hover:text-[#31572C] rounded-md transition-colors duration-150"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Star className="w-4 h-4 mr-2" /> Mis Opiniones
                      </Link>

                      <div className="h-px bg-gray-100 my-1 mx-4"></div>

                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          signOut();
                        }}
                        className="flex items-center w-[calc(100%-16px)] mx-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors duration-150"
                      >
                        <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Opciones para usuarios invitados */}
                      <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="block mx-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#31572C]/10 hover:text-[#31572C] rounded-md transition-colors duration-150"
                      >
                        Iniciar Sesión
                      </Link>

                      <Link
                        href="/register"
                        className="block mx-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#31572C]/10 hover:text-[#31572C] rounded-md transition-colors duration-150"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Crear Cuenta
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </header>
  );
}
