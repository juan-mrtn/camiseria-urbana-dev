// src/app/(shop)/carrito/page.tsx
"use client";

import { useCart } from "@/providers/CartProvider";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, removeFromCart, cartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center flex flex-col items-center">
        <ShoppingBag className="w-20 h-20 text-gray-300 mb-6" />
        <h1 className="text-3xl font-black text-gray-900 mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-8">¿Aún no te decides? Tenemos modelos increíbles esperándote.</p>
        <Link href="/catalogo" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Lista de Productos */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="relative w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {/* Asumimos que item.imagen es una URL válida, por ahora usamos un div de color si no hay imagen real en el proyecto */}
                <div className="absolute inset-0 bg-gray-200"></div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-900">{item.nombre}</h3>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition">
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Talle: <span className="font-bold text-gray-700">{item.talle}</span></p>
                  <p className="text-sm text-gray-500">Cantidad: <span className="font-bold text-gray-700">{item.cantidad}</span></p>
                </div>
                <p className="font-black text-indigo-600 text-lg">
                  ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen del Pedido */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del pedido</h2>
          
          <div className="space-y-4 border-b border-gray-200 pb-6 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${cartTotal.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span className="text-green-600 font-bold">¡Gratis!</span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-8">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-3xl font-black text-indigo-600">${cartTotal.toLocaleString('es-AR')}</span>
          </div>

          <Link 
            href="/checkout" 
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-lg font-bold uppercase hover:bg-indigo-600 transition"
          >
            Avanzar al pago <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}