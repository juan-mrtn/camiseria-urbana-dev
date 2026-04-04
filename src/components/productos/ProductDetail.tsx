// src/components/productos/ProductDetail.tsx
"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Heart, Truck, Star, AlertCircle } from 'lucide-react';

interface ProductDetailProps {
  producto: {
    id: string;
    nombre: string;
    descripcion: string;
    codigo: string;
    precioBase: number;
    imagenes: string[];
    stockTotal: number;
    variantes: { 
      id: string; 
      talle: string; 
      color: string; 
      material: string; 
      precio: number; 
      stock: number; 
      imagen: string 
    }[];
    promocion: { tipo: string; descuento: number } | null;
    opinionesCount?: number;
  }
}

export default function ProductDetail({ producto }: ProductDetailProps) {

  // Estado para la variante seleccionada (por defecto la primera con stock)
  const [selectedVariant, setSelectedVariant] = useState(
    producto.variantes.find(v => v.stock > 0) || producto.variantes[0]
  );

  const tallesDisponibles = Array.from(new Set(producto.variantes.map(v => v.talle)));

  const precioFinal = producto.promocion ? producto.precioBase * (1 - producto.promocion.descuento / 100) : producto.precioBase;
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-6">
        Inicio &gt; Catálogo &gt; <span className="text-gray-900 font-medium">{producto.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Galería de Imágenes */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] w-full bg-gray-100 rounded-lg overflow-hidden">
            <Image src={producto.imagenes[0]} alt={producto.nombre} fill className="object-cover" />
            
            {/* Badge de Promoción superpuesto en la imagen */}
            {producto.promocion && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-sm font-bold rounded-full">
                {producto.promocion.tipo === 'Descuento' ? `-${producto.promocion.descuento}% OFF` : producto.promocion.tipo}
              </div>
            )}
          </div>
          
          {producto.imagenes.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {producto.imagenes.map((img, i) => (
                <div key={i} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden border hover:border-indigo-600 cursor-pointer">
                  <Image src={img} alt={`${producto.nombre} vista ${i}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información de Compra */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{producto.nombre}</h1>
            
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-2xl font-bold text-indigo-600">
                ${precioFinal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
              {producto.promocion?.tipo === 'Descuento' && (
                <span className="text-lg text-gray-400 line-through">
                  ${producto.precioBase.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-yellow-400">
            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < 4 ? "currentColor" : "none"} />)}
            <span className="text-gray-500 text-sm">({producto.opinionesCount} opiniones)</span>
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
              <div className="flex gap-3">
                {tallesDisponibles.map(talle => (
                  <button
                    key={talle}
                    type="button"
                    onClick={() => {
                      const variant = producto.variantes.find(v => v.talle === talle && v.stock > 0)
                        || producto.variantes.find(v => v.talle === talle);
                      if (variant) setSelectedVariant(variant);
                    }}
                    className={`w-12 h-12 border-2 flex items-center justify-center font-bold transition ${selectedVariant?.talle === talle ? 'border-black' : 'hover:border-black'}`}
                  >
                    {talle}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-4">
            <button 
              disabled={producto.stockTotal === 0}
              className="flex-1 bg-indigo-600 text-white py-4 font-bold uppercase hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {producto.stockTotal > 0 ? 'Agregar al carrito' : 'Agotado'}
            </button>
            <button className="p-4 border hover:bg-gray-50" title="Añadir a favoritos">
              <Heart className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Calculadora de Envío y Descripción (Mantenemos igual) */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Truck size={18} /> Calculadora de envío
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Tu código postal" className="flex-1 border p-2 text-sm" />
              <button className="bg-gray-800 text-white px-4 py-2 text-sm font-bold">Calcular</button>
            </div>
          </div>

          <div>
            <h3 className="font-bold border-b pb-2 mb-3">Descripción</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{producto.descripcion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}