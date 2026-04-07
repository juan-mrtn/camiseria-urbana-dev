// src/app/(shop)/checkout/CheckoutClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/providers/CartProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, Circle, Plus, Lock, ArrowLeft, Truck } from "lucide-react";

interface CheckoutClientProps {
  session: any;
  direcciones: any[];
}

export default function CheckoutClient({ session, direcciones }: CheckoutClientProps) {
  const { items, cartTotal } = useCart();
  const router = useRouter();

  // Redirigir al catálogo si el carrito está vacío
  useEffect(() => {
    if (items.length === 0) {
      router.push("/catalogo");
    }
  }, [items, router]);

  // Estado para la dirección elegida. Por defecto usamos la principal o la primera.
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<string | null>(
    direcciones.find(d => d.principal)?.id || direcciones[0]?.id || null
  );

  const costoEnvio = 3990;
  const totalAPagar = cartTotal + costoEnvio;

  const handlePagar = () => {
    if (!direccionSeleccionada) {
      alert("Por favor, selecciona o agrega una dirección de envío.");
      return;
    }
    // Aquí iría la lógica para llamar a tu Server Action que crea la preferencia en MercadoPago
    alert("¡Redirigiendo a Mercado Pago para procesar el pago de $" + totalAPagar.toLocaleString('es-AR') + "!");
  };

  if (items.length === 0) return null; // Evita destellos mientras redirige

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* COLUMNA IZQUIERDA: CUENTA Y DIRECCIONES */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Tarjeta de Cuenta */}
        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Cuenta</h3>
          <div className="flex items-center gap-4 mb-4">
            {session.user.image ? (
              <img src={session.user.image} alt="Avatar" className="w-12 h-12 rounded-full border border-gray-200" />
            ) : (
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                {session.user.name?.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold text-gray-900">{session.user.name}</p>
              <p className="text-gray-500 text-sm">{session.user.email}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Tu inicio de sesión es únicamente con Google. Si no eres tú, puedes cerrar sesión y cambiar de cuenta.
          </p>
        </div>

        {/* Tarjeta de Direcciones */}
        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Direcciones guardadas</h3>
          
          <div className="flex flex-col gap-4 mb-4">
            {direcciones.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No tienes direcciones guardadas.</p>
            ) : (
              direcciones.map((dir) => {
                const isSelected = direccionSeleccionada === dir.id;
                return (
                  <div 
                    key={dir.id} 
                    onClick={() => setDireccionSeleccionada(dir.id)}
                    className={`border rounded-xl p-4 flex justify-between items-start cursor-pointer transition-all ${isSelected ? 'border-violet-600 bg-violet-50/30' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                  >
                    <div>
                      <p className="font-bold text-gray-900 mb-1">{dir.titulo}</p>
                      <p className="text-sm text-gray-600">{dir.calle} {dir.numero}{dir.departamento ? `, Depto ${dir.departamento}` : ''}</p>
                      <p className="text-sm text-gray-600">{dir.ciudad}, {dir.provincia}</p>
                      <p className="text-sm text-gray-500 mt-1">CP {dir.codigoPostal}</p>
                    </div>
                    <div>
                      {isSelected ? (
                        <span className="flex items-center gap-1.5 text-sm font-bold text-violet-700 bg-violet-100 px-3 py-1.5 rounded-lg border border-violet-200">
                          <CheckCircle2 className="w-4 h-4" /> Usar esta
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-sm font-bold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50">
                          <Circle className="w-4 h-4" /> Seleccionar
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <span className="text-sm font-bold text-gray-900">¿Necesitas otra dirección?</span>
            <button className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <Plus className="w-4 h-4" /> Agregar dirección
            </button>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: RESUMEN Y PAGO */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Resumen del Pedido */}
        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
          <h3 className="font-bold text-gray-900 text-lg mb-6">Resumen del pedido</h3>
          
          <div className="flex flex-col gap-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <Image src={item.imagen_url} alt={item.nombre} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-sm">{item.nombre}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Talla {item.talle} · Cant. {item.cantidad}</p>
                </div>
                <div className="font-bold text-gray-900">
                  ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-6 border-t border-gray-100 text-sm">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Subtotal</span>
              <span>${cartTotal.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Envío (estándar)</span>
              <span>${costoEnvio.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Impuestos</span>
              <span>$0</span>
            </div>
          </div>

          <div className="flex justify-between items-end pt-6 mt-4 border-t border-gray-100">
            <span className="font-bold text-gray-900 text-lg">Total</span>
            <span className="text-2xl font-black text-gray-900">${totalAPagar.toLocaleString('es-AR')}</span>
          </div>

          <div className="mt-6 flex items-center justify-between p-4 border border-gray-200 rounded-xl">
             <div className="w-12 h-8 bg-blue-50 border border-blue-100 rounded flex items-center justify-center font-black text-[#009EE3] text-xs italic">
               mercado<br/>pago
             </div>
             <button onClick={handlePagar} className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors">
               Pagar con Mercado Pago <Lock className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* Info Entrega */}
        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm flex items-center justify-between">
           <div className="flex gap-4">
             <Truck className="w-6 h-6 text-gray-700 mt-1" />
             <div>
               <h4 className="font-bold text-gray-900">Estándar</h4>
               <p className="text-sm text-gray-500">Llega entre 3-5 días hábiles</p>
             </div>
           </div>
           <span className="font-bold text-gray-900">${costoEnvio.toLocaleString('es-AR')}</span>
        </div>

      </div>

      {/* FOOTER DEL CHECKOUT (Botones finales) */}
      <div className="lg:col-span-12 mt-8">
         <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center">
            
            {/* Stepper simulado */}
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
              Cuenta <span className="mx-1">•</span> Dirección <span className="mx-1">•</span> <span className="text-gray-900">Pago</span> <span className="mx-1">•</span> Confirmación
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl justify-center mb-6">
              <button onClick={() => router.push('/carrito')} className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-4 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5" /> Volver al carrito
              </button>
              <button onClick={handlePagar} className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl transition-colors">
                Pagar con Mercado Pago <Lock className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 font-medium">
              Al continuar, serás redirigido a Mercado Pago para completar tu pago.
            </p>
         </div>
      </div>

    </div>
  );
}