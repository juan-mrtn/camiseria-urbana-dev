'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, Percent } from "lucide-react";

// Mocks de datos simulando lo que vendría de tu Context/Zustand o Base de Datos
const inicialCarrito = [
  {
    id: '1',
    nombre: 'Camisa Algodón M',
    color: 'Blanco',
    talle: 'M',
    precio: 9999,
    cantidad: 2,
    imagen: '/images/Gemini_Generated_blanqui.png'
  },
  {
    id: '2',
    nombre: 'Camisa Jean L',
    color: 'Azul',
    talle: 'L',
    precio: 8999,
    cantidad: 1,
    imagen: '/images/Gemini_Generated_Image_azul.png'
  }
];

export default function CartPage() {
  const [carrito, setCarrito] = useState(inicialCarrito);
  const [cupon, setCupon] = useState('');

  // Funciones interactivas
  const actualizarCantidad = (id: string, delta: number) => {
    setCarrito(prev => prev.map(item => {
      if (item.id === id) {
        const nuevaCantidad = item.cantidad + delta;
        return { ...item, cantidad: nuevaCantidad > 0 ? nuevaCantidad : 1 };
      }
      return item;
    }));
  };

  const eliminarItem = (id: string) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  // Cálculos matemáticos
  const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const costoEnvio = carrito.length > 0 ? 1500 : 0; // Si no hay items, no hay envío
  const total = subtotal + costoEnvio;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-20 mt-4">
      
      {/* TÍTULO */}
      <div className="border border-gray-200 rounded-xl py-4 bg-white shadow-sm flex items-center justify-center">
        <h1 className="text-xl font-bold text-gray-900">Carrito de compras</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: PRODUCTOS Y CUPÓN */}
        <div className="flex-1 w-full flex flex-col gap-4">
          
          {/* Lista de Productos */}
          {carrito.length === 0 ? (
            <div className="border border-gray-200 rounded-xl p-8 bg-white text-center shadow-sm">
              <p className="text-gray-500 mb-4">Tu carrito está vacío.</p>
              <Link href="/productos" className="text-indigo-600 font-bold hover:underline">
                Volver a la tienda
              </Link>
            </div>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                
                {/* Imagen */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                  <Image 
                    src={item.imagen} 
                    alt={item.nombre} 
                    fill 
                    className="object-cover" 
                  />
                </div>

                {/* Info del Producto */}
                <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left w-full">
                  <h3 className="font-bold text-gray-900">{item.nombre}</h3>
                  <p className="text-sm text-gray-600 mt-1 font-medium">
                    Color: {item.color} • Talle: {item.talle}
                  </p>
                </div>

                {/* Controles: Cantidad, Precio y Eliminar */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                  
                  {/* Selector de Cantidad */}
                  <div className="flex items-center border border-gray-300 rounded-lg h-10 w-28">
                    <button 
                      onClick={() => actualizarCantidad(item.id, -1)}
                      className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors rounded-l-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-center font-semibold text-gray-900">
                      {item.cantidad}
                    </span>
                    <button 
                      onClick={() => actualizarCantidad(item.id, 1)}
                      className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors rounded-r-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Precio Unitario */}
                  <div className="font-bold text-gray-900 w-24 text-center sm:text-right">
                    ${item.precio.toLocaleString('es-AR')} <span className="text-xs text-gray-500 font-normal">c/u</span>
                  </div>

                  {/* Botón Eliminar */}
                  <button 
                    onClick={() => eliminarItem(item.id)}
                    className="flex items-center gap-1.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 font-semibold py-2 px-3.5 rounded-lg transition-colors text-sm shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Sección Cupón */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Percent className="w-4 h-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Aplicar cupón" 
                value={cupon}
                onChange={(e) => setCupon(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2.5 pl-9 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
            <button className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm">
              Aplicar
            </button>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN DE COMPRA */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm flex flex-col gap-5 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900">Resumen de compra</h2>
            
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-gray-700 font-medium">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700 font-medium">
                <span>Envío</span>
                <span>${costoEnvio.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">${total.toLocaleString('es-AR')}</span>
            </div>

            <button 
              disabled={carrito.length === 0}
              className={`mt-2 w-full py-3.5 rounded-lg font-bold transition-all shadow-md
                ${carrito.length > 0 
                  ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              Continuar compra
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}