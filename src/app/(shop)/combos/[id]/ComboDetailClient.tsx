"use client";

import Image from 'next/image';
import { useState, useTransition, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Minus, Plus, CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/providers/CartProvider';
import { addToCartAction } from '@/actions/carrito.actions';
import ProductImageGallery from '@/components/shop/ProductImageGallery';

interface ComboDetailClientProps {
  combo: {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen_principal: string;
    galeria_imagenes: string[];
  };
  comboItems: {
    cantidad: number;
    nombre: string;
    imagen_principal: string;
    talle: string;
  }[];
  stockDisponible: number;
}

export default function ComboDetailClient({ combo, comboItems, stockDisponible }: ComboDetailClientProps) {
  const { addToCart } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [isPending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [flyingDrops, setFlyingDrops] = useState<{ id: number; startX: number; startY: number; targetX: number; targetY: number }[]>([]);

  const getCartTarget = () => {
    const icon = document.getElementById("cart-icon");
    if (icon) {
      const rect = icon.getBoundingClientRect();
      return { x: rect.left + rect.width / 2 - 25, y: rect.top + rect.height / 2 - 25 };
    }
    return { x: window.innerWidth - 50, y: 50 };
  };

  const handleAddToCart = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (stockDisponible === 0) return;

    if (e) {
      const buttonRect = buttonRef.current?.getBoundingClientRect();
      const startX = buttonRect ? buttonRect.left + buttonRect.width / 2 - 12 : e.clientX - 12;
      const startY = buttonRect ? buttonRect.top + buttonRect.height / 2 - 12 : e.clientY - 12;
      const target = getCartTarget();
      const id = Date.now();
      
      setFlyingDrops(prev => [...prev, { id, startX, startY, targetX: target.x, targetY: target.y }]);
      
      setTimeout(() => {
        setFlyingDrops(prev => prev.filter(drop => drop.id !== id));
      }, 1000);
    }

    addToCart({
      id: combo.id,
      nombre: combo.nombre,
      precio: combo.precio,
      precioOriginal: combo.precio,
      talle: "Pack",
      cantidad: cantidad,
      imagen_url: combo.imagen_principal || "/camisa.png",
      promocion: null,
      esCombo: true
    });

    startTransition(async () => {
      try {
        await addToCartAction(combo.id, cantidad, combo.precio, true);
      } catch (error) {
        console.error("Error sincronizando el carrito con la BD", error);
      }
    });

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const images = combo.imagen_principal 
    ? [combo.imagen_principal, ...(combo.galeria_imagenes || [])] 
    : ["/camisa.png"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-indigo-600 transition-colors">Inicio</Link> &gt; 
        <Link href="/catalogo" className="hover:text-indigo-600 transition-colors">Catálogo</Link> &gt; 
        <span className="text-gray-900 font-medium line-clamp-1">{combo.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative w-full rounded-lg overflow-hidden border border-gray-100">
          <ProductImageGallery images={images} altText={combo.nombre} />
          <div className="absolute top-4 left-4 z-20 bg-indigo-500 text-white px-3 py-1 text-sm font-bold rounded-full pointer-events-none shadow-md">
            COMBO ESPECIAL
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900">{combo.nombre}</h1>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl font-black text-indigo-600">
                ${Number(combo.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className={`flex items-center gap-2 text-sm font-medium ${stockDisponible > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <AlertCircle size={16} />
            {stockDisponible > 0
              ? `${stockDisponible} combos disponibles`
              : 'Sin stock por el momento'}
          </div>

          <div>
            <h3 className="font-bold border-b pb-2 mb-3 text-lg">¿Qué incluye este pack?</h3>
            <div className="grid grid-cols-1 gap-3 mt-4">
              {comboItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="relative w-16 h-16 bg-white rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
                    <Image src={item.imagen_principal || "/camisa.png"} alt={item.nombre} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm">{item.nombre}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Talle: <span className="font-bold">{item.talle}</span> | Cantidad: <span className="font-bold">{item.cantidad}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {stockDisponible > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Cantidad de Combos</h3>
              <div className="flex items-center border-2 border-gray-200 w-fit rounded-lg overflow-hidden">
                <button
                  onClick={() => setCantidad(c => Math.max(1, c - 1))}
                  className="p-3 hover:bg-gray-100 transition text-gray-700"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-bold">{cantidad}</span>
                <button
                  onClick={() => setCantidad(c => Math.min(stockDisponible, c + 1))}
                  className="p-3 hover:bg-gray-100 transition text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
                  disabled={cantidad >= stockDisponible}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <motion.button
              whileTap={{ scale: 0.95, borderRadius: "1.5rem" }}
              ref={buttonRef as any}
              onClick={handleAddToCart}
              disabled={stockDisponible === 0 || isPending}
              className="flex-1 bg-indigo-600 text-white py-4 font-bold uppercase hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg shadow-md"
            >
              {stockDisponible > 0 ? (isPending ? 'Agregando...' : 'Agregar Combo al carrito') : 'Combo Agotado'}
            </motion.button>
          </div>

          {combo.descripcion && (
            <div className="mt-8">
              <h3 className="font-bold border-b pb-2 mb-3 text-lg">Descripción</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{combo.descripcion}</p>
            </div>
          )}
        </div>

        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <div className="flex flex-col">
              <span className="font-bold text-sm">¡Combo agregado al carrito!</span>
              <span className="text-xs text-gray-400">{combo.nombre}</span>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {flyingDrops.map(drop => (
          <motion.div
            key={drop.id}
            initial={{ opacity: 1, scale: 0.5, x: drop.startX, y: drop.startY }}
            animate={{ opacity: 0.3, scale: 1, x: drop.targetX, y: drop.targetY }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="fixed top-0 left-0 z-[100] w-6 h-6 bg-indigo-500 rounded-full shadow-lg pointer-events-none"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
