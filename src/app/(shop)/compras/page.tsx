import { getPurchaseHistoryAction } from "@/actions/compra.actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, Clock, XCircle, ArrowLeft, ChevronRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ComprasPage() {
  const result = await getPurchaseHistoryAction();

  if (!result.success) {
    redirect("/login");
  }

  const compras = result.compras || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 min-h-[70vh]">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6 gap-2">
        <Link href="/" className="hover:text-gray-900">Inicio</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/perfil" className="hover:text-gray-900">Mi Cuenta</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Mis Compras</span>
      </div>

      <div className="flex items-center justify-between border-b pb-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Historial de compras</h1>
        <p className="text-sm text-gray-500 hidden md:block">Revisa el estado de tus pedidos y gestiona acciones</p>
      </div>

      {compras.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Aún no tienes compras</h2>
          <p className="text-gray-500 mb-6">Explora nuestro catálogo y encuentra tus prendas favoritas.</p>
          <Link href="/catalogo" className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {compras.map((compra: any) => {
            const isConfirmado = compra.estado_pago === 'confirmado';
            const isRechazado = compra.estado_pago === 'rechazado';

            return (
              <div key={compra.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                {/* Header del pedido */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 gap-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-bold text-gray-900">Pedido #{compra.numero}</span>
                    <span className="text-gray-300 hidden sm:inline">•</span>
                    <span className="text-gray-600">Fecha: {new Date(compra.fecha).toLocaleDateString('es-AR')}</span>
                    <span className="text-gray-300 hidden sm:inline">•</span>
                    <span className="font-bold text-gray-900">Total: ${Number(compra.total).toLocaleString('es-AR')}</span>
                  </div>

                  {/* Badge Estado */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${isConfirmado ? 'bg-green-50 text-green-700 border-green-200' :
                      isRechazado ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-orange-50 text-orange-700 border-orange-200'
                    }`}>
                    {isConfirmado && <Check className="w-3.5 h-3.5" />}
                    {!isConfirmado && !isRechazado && <Clock className="w-3.5 h-3.5" />}
                    {isRechazado && <XCircle className="w-3.5 h-3.5" />}
                    {isConfirmado ? 'Pago exitoso' : isRechazado ? 'Rechazado' : 'Procesando'}
                  </div>
                </div>

                {/* Items del pedido */}
                <div className="p-4 space-y-4">
                  {compra.lineas.map((linea: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                      <div className="relative w-16 h-16 bg-gray-100 rounded-md border border-gray-200 overflow-hidden flex-shrink-0">
                        {linea.imagen_url ? (
                          <Image src={linea.imagen_url} alt={linea.producto_nombre} fill className="object-cover" sizes="64px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sin foto</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{linea.producto_nombre}</h4>
                        {linea.talle && <p className="text-xs text-gray-500 mt-0.5">Talle {linea.talle}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">${Number(linea.precio_unitario).toLocaleString('es-AR')}</p>
                        <p className="text-xs text-gray-500 mt-0.5">x{linea.cantidad}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer del pedido */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 px-5 rounded-lg transition-colors">
                    Detalle de la compra
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <Link href="/perfil" className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a Mi Cuenta
        </Link>
      </div>
    </div>
  );
}
