// src/components/productos/ProductDetail.tsx
"use client";

import Image from 'next/image';
import { useState, useTransition } from 'react';
import { Truck, Star, AlertCircle, Minus, Plus, CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/providers/CartProvider'; // O la ruta donde lo hayas guardado
import BotonFavorito from '@/components/shop/BotonFavorito';
import { addToCartAction } from '@/actions/carrito.actions';
import ProductImageGallery from '@/components/shop/ProductImageGallery';
import ShippingCalculator from '@/components/shop/ShippingCalculator';

interface ProductDetailProps {
  favoritosIniciales?: string[];
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
      imagen: string
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

export default function ProductDetail({ producto, favoritosIniciales = [] }: ProductDetailProps) {
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

  const tallesDisponibles = Array.from(new Set(producto.variantes.map(v => v.talle)));
  
  const precioBase = selectedVariant?.precio ?? producto.precioBase;
  const precioFinal = selectedVariant?.precioFinal ?? producto.precioFinal;

  // Función que se ejecuta al presionar "Agregar al carrito"
  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock === 0) return;

    // 1. Sincronización Local (Contexto del lado del cliente)
    addToCart({
      id: selectedVariant.id, // Usamos el ID único de la variante
      nombre: producto.nombre,
      precio: precioFinal, // Mantenemos para fallback
      precioOriginal: precioBase, // Necesario para calcular el 2x1 correcto
      talle: selectedVariant.talle,
      cantidad: cantidad,
      imagen_url: selectedVariant.imagen || producto.imagenes[0],
      promocion: producto.promocionActiva && producto.promocion ? {
        tipo: producto.promocion.tipo,
        descuento: producto.promocion.descuento
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
        <Link href="/" className="hover:text-indigo-600 transition-colors">Inicio</Link> &gt; 
        <Link href="/catalogo" className="hover:text-indigo-600 transition-colors">Catálogo</Link> &gt; 
        <span className="text-gray-900 font-medium line-clamp-1">{producto.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Galería de Imágenes */}
        <div className="relative w-full rounded-lg overflow-hidden border border-gray-100">
          <ProductImageGallery images={producto.imagenes} altText={producto.nombre} />

          {/* Badge de Promoción superpuesto en la imagen */}
          {producto.promocionActiva && producto.promocion && (
            <div className="absolute top-4 left-4 z-20 bg-indigo-500 text-white px-3 py-1 text-sm font-bold rounded-full pointer-events-none shadow-md">
              {producto.promocion.tipo?.toLowerCase() === '2x1' ? '2x1' : `-${producto.promocion.descuento}% OFF`}
            </div>
          )}
        </div>

        {/* Información de Compra */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{producto.nombre}</h1>

            <div className="flex items-baseline gap-3 mt-2">
              <span className={`text-2xl font-bold ${precioBase > precioFinal ? 'text-indigo-600' : 'text-indigo-600'}`}>
                ${precioFinal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
              {producto.promocionActiva && (
                <span className="text-lg text-gray-400 line-through">
                  ${precioBase.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => {
              const activeStars = producto.promedio_estrellas !== null && producto.promedio_estrellas !== undefined ? Math.round(producto.promedio_estrellas) : 5;
              return (
                <Star key={i} size={16} className={i < activeStars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
              );
            })}
            <span className="text-gray-500 text-sm ml-2 font-medium">
              {producto.promedio_estrellas !== null && producto.promedio_estrellas !== undefined ? producto.promedio_estrellas.toFixed(1) : "5.0"} ({producto.opinionesCount || 0} opiniones)
            </span>
          </div>

          {/* Indicador de Stock */}
          <div className={`flex items-center gap-2 text-sm font-medium ${producto.stockTotal > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <AlertCircle size={16} />
            {producto.stockTotal > 0
              ? `${producto.stockTotal} unidades disponibles`
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
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 border-2 border-indigo-600 scale-105'
                          : tieneStock
                            ? 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50'
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
              <p className="text-xs text-gray-500 mt-2">
                Stock de esta variante: <span className="font-bold">{selectedVariant.stock}</span>
              </p>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className="flex-1 bg-indigo-600 text-white py-4 font-bold uppercase hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg"
            >
              {selectedVariant?.stock > 0 ? 'Agregar al carrito' : 'Variante Agotada'}
            </button>
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
            {producto.opiniones && producto.opiniones.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {producto.opiniones.map((opinion) => (
                  <div key={opinion.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-gray-800 text-sm">{opinion.usuario_nombre || "Usuario Anónimo"}</div>
                      <div className="text-xs text-gray-400">{new Date(opinion.fecha).toLocaleDateString()}</div>
                    </div>
                    <div className="flex mb-2 gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < Number(opinion.estrellas) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 italic">"{opinion.comentario}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
                <p className="text-sm text-gray-500">Aún no hay opiniones para este producto.</p>
                <p className="text-xs text-gray-400 mt-1">¡Sé el primero en comprar y compartir tu experiencia!</p>
              </div>
            )}
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

    </div>
  );
}