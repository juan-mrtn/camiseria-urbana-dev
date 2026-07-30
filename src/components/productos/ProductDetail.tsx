// src/components/productos/ProductDetail.tsx
"use client";

import Image from 'next/image';
import { useState, useTransition, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Truck, Star, AlertCircle, Minus, Plus, CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/providers/CartProvider'; // O la ruta donde lo hayas guardado
import BotonFavorito from '@/components/shop/BotonFavorito';
import { addToCartAction } from '@/actions/carrito.actions';
import ProductImageGallery from '@/components/shop/ProductImageGallery';
import ShippingCalculator from '@/components/shop/ShippingCalculator';
import ReviewList from '@/components/product/ReviewList';

interface ProductDetailProps {
  favoritosIniciales?: string[];
  userRole?: string;
  producto: {
    id: string;
    nombre: string;
    descripcion: string;
    codigo: string;
    precioBase: number;
    precioFinal: number;
    promocionActiva: boolean;
    imagenes: string[];
    stockTotal: number;
    variantes: {
      id: string;
      talle: string;
      color: string;
      material: string;
      precio: number;
      precioFinal: number;
      stock: number;
      imagen: string;
      promocion?: { tipo: string; descuento: number } | null;
      promocionActiva?: boolean;
    }[];
    promocion: { tipo: string; descuento: number } | null;
    opinionesCount?: number;
    promedio_estrellas?: number | null;
    opiniones?: {
      id: string;
      estrellas: number;
      comentario: string;
      fecha: Date;
      usuario_nombre: string | null;
    }[];
  }
}

export default function ProductDetail({ producto, favoritosIniciales = [], userRole = 'guest' }: ProductDetailProps) {
  // Traemos la función para agregar al carrito desde nuestro Contexto Global
  const { addToCart } = useCart();

  // Estado para la variante seleccionada
  const [selectedVariant, setSelectedVariant] = useState(
    producto.variantes.find(v => v.stock > 0) || producto.variantes[0]
  );

  // NUEVO: Estado para controlar la cantidad a comprar
  const [cantidad, setCantidad] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [isPending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [flyingDrops, setFlyingDrops] = useState<{ id: number; startX: number; startY: number; targetX: number; targetY: number }[]>([]);

  const tallesDisponibles = Array.from(new Set(producto.variantes.map(v => v.talle)));

  const precioBase = selectedVariant?.precio ?? producto.precioBase;
  const precioFinal = selectedVariant?.precioFinal ?? producto.precioFinal;

  // Función que se ejecuta al presionar "Agregar al carrito"
  const getCartTarget = () => {
    const icon = document.getElementById("cart-icon");
    if (icon) {
      const rect = icon.getBoundingClientRect();
      return { x: rect.left + rect.width / 2 - 25, y: rect.top + rect.height / 2 - 25 };
    }
    return { x: window.innerWidth - 50, y: 50 };
  };

  const handleAddToCart = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (!selectedVariant || selectedVariant.stock === 0) return;

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

    // 1. Sincronización Local (Contexto del lado del cliente)
    addToCart({
      id: selectedVariant.id, // Usamos el ID único de la variante
      nombre: producto.nombre,
      precio: precioFinal, // Mantenemos para fallback
      precioOriginal: precioBase, // Necesario para calcular el 2x1 correcto
      talle: selectedVariant.talle,
      cantidad: cantidad,
      imagen_url: selectedVariant.imagen || producto.imagenes[0],
      promocion: (selectedVariant?.promocionActiva || producto.promocionActiva) && (selectedVariant?.promocion || producto.promocion) ? {
        tipo: (selectedVariant?.promocion || producto.promocion)!.tipo,
        descuento: (selectedVariant?.promocion || producto.promocion)!.descuento
      } : null
    });

    // 2. Sincronización Remota (DB del lado del servidor)
    startTransition(async () => {
      try {
        await addToCartAction(selectedVariant.id, cantidad, precioFinal);
      } catch (error) {
        console.error("Error sincronizando el carrito con la BD", error);
      }
    });

    // Notificación de agregado al carrito 
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-[#31572C] transition-colors">Inicio</Link> &gt;
        <Link href="/catalogo" className="hover:text-[#31572C] transition-colors">Catálogo</Link> &gt;
        <span className="text-gray-900 font-medium line-clamp-1">{producto.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Galería de Imágenes */}
        <div className="relative w-full rounded-lg overflow-hidden border border-gray-100">
          <ProductImageGallery images={producto.imagenes} altText={producto.nombre} />

          {/* Badge de Promoción superpuesto en la imagen */}
          {(selectedVariant?.promocionActiva || producto.promocionActiva) && (selectedVariant?.promocion || producto.promocion) && (
            <div className="absolute top-4 left-4 z-20 bg-[#31572C] text-white px-3 py-1 text-sm font-bold rounded-full pointer-events-none shadow-md">
              {(selectedVariant?.promocion || producto.promocion)!.tipo?.toLowerCase() === '2x1' ? '2x1' : `-${(selectedVariant?.promocion || producto.promocion)!.descuento}% OFF`}
            </div>
          )}
        </div>

        {/* Información de Compra */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{producto.nombre}</h1>

            <div className="flex items-baseline gap-3 mt-2">
              <span className={`text-2xl font-bold ${precioBase > precioFinal ? 'text-[#31572C]' : 'text-[#31572C]'}`}>
                ${precioFinal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
              {precioBase > precioFinal && (
                <span className="text-lg text-gray-400 line-through">
                  ${precioBase.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>

          {(producto.opinionesCount !== undefined && producto.opinionesCount > 0) && (
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => {
                const activeStars = producto.promedio_estrellas !== null && producto.promedio_estrellas !== undefined ? Math.round(producto.promedio_estrellas) : 0;
                return (
                  <Star key={i} size={16} className={i < activeStars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                );
              })}
              <span className="text-gray-500 text-sm ml-2 font-medium">
                {producto.promedio_estrellas !== null && producto.promedio_estrellas !== undefined ? producto.promedio_estrellas.toFixed(1) : "0.0"} ({producto.opinionesCount} opiniones)
              </span>
            </div>
          )}

          {/* Indicador de Stock */}
          <div className={`flex items-center gap-2 text-sm font-medium ${producto.stockTotal > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <AlertCircle size={16} />
            {producto.stockTotal > 0
              ? (userRole === 'admin' ? `${producto.stockTotal} unidades disponibles` : 'Disponible')
              : 'Sin stock por el momento'}
          </div>

          {/* Selector de Talle */}
          {tallesDisponibles.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Talles Disponibles</h3>
              <div className="flex gap-3 flex-wrap">
                {tallesDisponibles.map(talle => {
                  const isSelected = selectedVariant?.talle === talle;

                  // Buscamos si hay alguna variante de este talle con stock
                  const variantConStock = producto.variantes.find(v => v.talle === talle && v.stock > 0);
                  const tieneStock = !!variantConStock;

                  return (
                    <button
                      key={talle}
                      type="button"
                      disabled={!tieneStock}
                      onClick={() => {
                        const variant = variantConStock || producto.variantes.find(v => v.talle === talle);
                        if (variant) {
                          setSelectedVariant(variant);
                          setCantidad(1); // Reseteamos la cantidad a 1 si cambia de talle
                        }
                      }}
                      className={`
                        w-12 h-12 rounded-lg font-bold text-sm flex items-center justify-center transition-all duration-200
                        ${isSelected
                          ? 'bg-[#31572C] text-white shadow-md shadow-[#90A955]/20 border-2 border-[#31572C] scale-105'
                          : tieneStock
                            ? 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#31572C] hover:text-[#31572C] hover:bg-[#31572C]/10'
                            : 'bg-gray-100 text-gray-400 border-2 border-gray-100 cursor-not-allowed opacity-60'
                        }
                      `}
                    >
                      {talle}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* NUEVO: Selector de Cantidad (Con límite dinámico según el stock de la variante) */}
          {selectedVariant && selectedVariant.stock > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Cantidad</h3>
              <div className="flex items-center border-2 border-gray-200 w-fit rounded-lg overflow-hidden">
                <button
                  onClick={() => setCantidad(c => Math.max(1, c - 1))}
                  className="p-3 hover:bg-gray-100 transition text-gray-700"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-bold">{cantidad}</span>
                <button
                  onClick={() => setCantidad(c => Math.min(selectedVariant.stock, c + 1))} // No puede superar el stock
                  className="p-3 hover:bg-gray-100 transition text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
                  disabled={cantidad >= selectedVariant.stock}
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {userRole === 'admin' ? (
                  <>Stock de esta variante: <span className="font-bold">{selectedVariant.stock}</span></>
                ) : (
                  selectedVariant.stock >= 1 && selectedVariant.stock <= 5 ? (
                    <span className="font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded inline-block">
                      ¡Últimas unidades disponibles!
                    </span>
                  ) : selectedVariant.stock > 5 ? (
                    <span className="font-bold text-green-600 hidden">Disponible</span>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-4">
            <motion.button
              whileTap={{ scale: 0.95, borderRadius: "1.5rem" }}
              ref={buttonRef as any}
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className="flex-1 bg-[#31572C] text-white py-4 font-bold uppercase hover:bg-[#90A955] transition disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg shadow-md"
            >
              {selectedVariant?.stock > 0 ? 'Agregar al carrito' : 'Variante Agotada'}
            </motion.button>
            {selectedVariant && (
              <BotonFavorito
                key={selectedVariant.id}
                productoVarianteId={selectedVariant.id}
                isFavoritoInicial={favoritosIniciales.includes(selectedVariant.id)}
              />
            )}
          </div>

          {/* Calculadora de Envío */}
          <ShippingCalculator total={precioFinal} />

          <div>
            <h3 className="font-bold border-b pb-2 mb-3 text-lg">Descripción</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{producto.descripcion}</p>
          </div>

          <div className="mt-8">
            <h3 className="font-bold border-b pb-2 mb-4 text-lg">Opiniones de Clientes</h3>
            <ReviewList opiniones={producto.opiniones} userRole={userRole} />
          </div>
        </div>
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <div className="flex flex-col">
              <span className="font-bold text-sm">¡Agregado al carrito!</span>
              <span className="text-xs text-gray-400">{producto.nombre} ({selectedVariant.talle})</span>
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
            className="fixed top-0 left-0 z-[100] w-6 h-6 bg-orange-500 rounded-full shadow-lg pointer-events-none"
          />
        ))}
      </AnimatePresence>

    </div>
  );
}