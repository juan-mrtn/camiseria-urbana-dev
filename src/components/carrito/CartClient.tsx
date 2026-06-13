"use client";

import { useCart, CartItem } from "@/providers/CartProvider";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useTransition, useEffect, useState } from "react";
import { removeFromCartAction, aplicarCuponAction, syncCartAction } from "@/actions/carrito.actions";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CartClientProps {
  dbItems: CartItem[] | null;
}

export default function CartClient({ dbItems }: CartClientProps) {
  const { items: localItems, removeFromCart, clearCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isApplyingCupon, startCuponTransition] = useTransition();
  const [cupon, setCupon] = useState("");
  const [cuponMsg, setCuponMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Sincronización automática de carrito local a DB cuando se loguea
  useEffect(() => {
    if (status === "authenticated" && dbItems === null && localItems.length > 0) {
      syncCartAction(localItems).then((res) => {
        if (res.success) {
          clearCart();
          router.refresh();
        }
      });
    }
  }, [status, dbItems, localItems, clearCart, router]);

  // Si dbItems existe (usuario logueado), usamos los datos de la DB como fuente de verdad
  const items = dbItems !== null ? dbItems : localItems;
  const cartTotalOriginal = items.reduce((total, item) => total + (item.precioOriginal || item.precio) * item.cantidad, 0);
  const cartTotal = items.reduce((total, item) => total + item.precio * item.cantidad, 0);
  const totalDescuento = cartTotalOriginal - cartTotal;

  const handleRemove = (id: string) => {
    // Sincronización Local (siempre lo hacemos por si era invitado)
    removeFromCart(id);
    
    // Sincronización DB
    startTransition(async () => {
      try {
        await removeFromCartAction(id);
      } catch (error) {
        console.error("Error eliminando del carrito en DB:", error);
      }
    });
  };

  const handleAplicarCupon = () => {
    if (!cupon.trim()) return;
    setCuponMsg(null);
    startCuponTransition(async () => {
      try {
        const res = await aplicarCuponAction(cupon);
        if (res.success) {
          setCuponMsg({ type: 'success', text: "Cupón aplicado correctamente" });
          setCupon("");
        } else {
          setCuponMsg({ type: 'error', text: res.error || "Error al aplicar cupón" });
        }
      } catch (error) {
        setCuponMsg({ type: 'error', text: "Ocurrió un error inesperado" });
      }
    });
  };

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
                <Image src={item.imagen_url} alt={item.nombre} fill sizes="100px" className="object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-900">{item.nombre}</h3>
                    <button onClick={() => handleRemove(item.id)} className="text-gray-400 hover:text-red-500 transition">
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Talle: <span className="font-bold text-gray-700">{item.talle}</span></p>
                  <p className="text-sm text-gray-500">Cantidad: <span className="font-bold text-gray-700">{item.cantidad}</span></p>
                </div>
                <div className="flex flex-col items-start">
                  {item.precioOriginal && item.precioOriginal > item.precio && (
                    <p className="text-sm text-gray-400 line-through">
                      ${(item.precioOriginal * item.cantidad).toLocaleString('es-AR')}
                    </p>
                  )}
                  <p className="font-black text-indigo-600 text-lg">
                    ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                  </p>
                </div>
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
              <span className={totalDescuento > 0 ? "line-through text-gray-400" : ""}>
                ${cartTotalOriginal.toLocaleString('es-AR')}
              </span>
            </div>
            {totalDescuento > 0 && (
              <div className="flex justify-between text-green-600 font-bold">
                <span>Descuento aplicado</span>
                <span>-${totalDescuento.toLocaleString('es-AR')}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span className="text-gray-500 font-medium">A calcular en checkout</span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-8">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-3xl font-black text-indigo-600">${cartTotal.toLocaleString('es-AR')}</span>
          </div>

          <div className="mb-8 border-t border-gray-200 pt-6">
            <label className="text-sm font-bold text-gray-700 block mb-2">¿Tienes un cupón?</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ingresa tu cupón" 
                value={cupon}
                onChange={(e) => setCupon(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
              />
              <button 
                onClick={handleAplicarCupon}
                disabled={isApplyingCupon || !cupon.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isApplyingCupon ? "..." : "Aplicar"}
              </button>
            </div>
            {cuponMsg && (
              <p className={`mt-2 text-sm font-bold ${cuponMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {cuponMsg.text}
              </p>
            )}
          </div>

          <button
            onClick={() => {
              if (status === "unauthenticated") {
                signIn(undefined, { callbackUrl: "/checkout" });
              } else {
                router.push("/checkout");
              }
            }}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-lg font-bold uppercase hover:bg-indigo-600 transition"
          >
            Avanzar al pago <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
