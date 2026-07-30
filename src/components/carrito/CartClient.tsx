"use client";

import { useCart, CartItem } from "@/providers/CartProvider";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus } from "lucide-react";
import { useTransition, useEffect, useState } from "react";
import { removeFromCartAction, aplicarCuponAction, syncCartAction, updateCartItemQuantityAction } from "@/actions/carrito.actions";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CartClientProps {
  dbItems: CartItem[] | null;
}

export default function CartClient({ dbItems }: CartClientProps) {
  const { items: localItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isApplyingCupon, startCuponTransition] = useTransition();
  const [cupon, setCupon] = useState("");
  const [cuponMsg, setCuponMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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

  // Filtrar items sin stock / con error de stock para el cálculo del total del carrito
  const itemsValidos = items.filter(item => !(item.stock_disponible !== undefined && (item.stock_disponible === 0 || item.cantidad > item.stock_disponible)));

  const cartTotalOriginal = itemsValidos.reduce((total, item) => total + (item.precioOriginal || item.precio) * item.cantidad, 0);
  const cartTotal = itemsValidos.reduce((total, item) => {
    let lineTotal = item.precio * item.cantidad;
    const basePrice = item.precioOriginal || item.precio;

    if (item.promocion?.tipo === '2x1') {
      const pagables = Math.floor(item.cantidad / 2) + (item.cantidad % 2);
      lineTotal = basePrice * pagables;
    } else if (item.promocion?.tipo === 'descuento' && item.promocion.descuento) {
      lineTotal = basePrice * (1 - item.promocion.descuento / 100) * item.cantidad;
    }

    return total + lineTotal;
  }, 0);
  const totalDescuento = cartTotalOriginal - cartTotal;

  const hasStockErrors = items.some(item => item.stock_disponible !== undefined && item.cantidad > item.stock_disponible);

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

  const handleUpdateQuantity = (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemove(item.id);
      return;
    }

    if (item.stock_disponible !== undefined && newQuantity > item.stock_disponible) {
      alert(`Solo quedan ${item.stock_disponible} unidades disponibles.`);
      return;
    }

    updateQuantity(item.id, newQuantity);

    startTransition(async () => {
      try {
        await updateCartItemQuantityAction(item.id, newQuantity);
      } catch (error) {
        console.error("Error al actualizar cantidad:", error);
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
        <Link href="/catalogo" className="bg-[#31572C] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#90A955] transition">
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
          {items.map((item) => {
            const hasStockError = item.stock_disponible !== undefined && item.cantidad > item.stock_disponible;
            const noStock = item.stock_disponible === 0;

            return (
              <div key={item.id} className={`flex gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm ${hasStockError ? 'opacity-70 border-red-300' : ''}`}>
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
                    {hasStockError && (
                      <p className="text-sm font-bold text-red-600 mt-1">
                        {noStock ? 'Sin stock disponible' : `Stock insuficiente (Disponible: ${item.stock_disponible} unidades)`}
                      </p>
                    )}
                    {item.esCombo ? (
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-[#31572C]/10 text-[#31572C] text-xs font-bold rounded-full">Pack / Combo</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">Talle: <span className="font-bold text-gray-700">{item.talle}</span></p>
                    )}
                    <div className="flex items-center mt-3 gap-3">
                      <span className="text-sm text-gray-500">Cantidad:</span>
                      <div className={`flex items-center border border-gray-200 rounded-lg overflow-hidden ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                        <button
                          onClick={() => handleUpdateQuantity(item, item.cantidad - 1)}
                          disabled={isPending}
                          className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className={`px-3 py-1 text-sm font-bold min-w-[2.5rem] text-center ${hasStockError ? 'text-red-600' : 'text-gray-900'}`}>
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item, item.cantidad + 1)}
                          disabled={isPending || (item.stock_disponible !== undefined && item.cantidad >= item.stock_disponible)}
                          className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition disabled:opacity-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start">
                    {hasStockError ? (
                      <div className="text-right">
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 block">
                          No sumado al total
                        </span>
                        <p className="text-sm text-gray-400 line-through mt-0.5">
                          ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                        </p>
                      </div>
                    ) : (
                      <>
                        {item.precioOriginal && item.precioOriginal > item.precio && (
                          <p className="text-sm text-gray-400 line-through">
                            ${(item.precioOriginal * item.cantidad).toLocaleString('es-AR')}
                          </p>
                        )}
                        <p className="font-black text-[#31572C] text-lg">
                          ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
            <span className="text-3xl font-black text-[#31572C]">${cartTotal.toLocaleString('es-AR')}</span>
          </div>

          <div className="mb-8 border-t border-gray-200 pt-6">
            <label className="text-sm font-bold text-gray-700 block mb-2">¿Tienes un cupón?</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ingresa tu cupón"
                value={cupon}
                onChange={(e) => setCupon(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#31572C] outline-none uppercase"
              />
              <button
                onClick={handleAplicarCupon}
                disabled={isApplyingCupon || !cupon.trim()}
                className="bg-[#31572C] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#90A955] transition disabled:opacity-50"
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

          {hasStockErrors && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-red-700">
                  <strong>Acción requerida:</strong> Algunos productos no tienen stock suficiente. Por favor, <strong>elimínalos</strong> o reduce la cantidad para poder avanzar al pago.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (status === "unauthenticated") {
                signIn(undefined, { callbackUrl: "/checkout" });
              } else {
                router.push("/checkout");
              }
            }}
            disabled={hasStockErrors || isApplyingCupon}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-lg font-bold uppercase hover:bg-[#90A955] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Avanzar al pago <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
