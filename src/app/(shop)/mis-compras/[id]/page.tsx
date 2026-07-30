import { auth } from "@/server/auth";
import { CompraRepository } from "@/repositories/compra.repository";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin } from "lucide-react";
import OrderStatusBadge from "@/components/shop/OrderStatusBadge";

export const dynamic = 'force-dynamic';

export default async function CompraDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const compra = await CompraRepository.obtenerDetalleCompra(id, session.user.id);

  if (!compra) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-[70vh]">
      <div className="mb-6">
        <Link href="/compras" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a mis compras
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header del Ticket */}
        <div className="bg-gray-50 border-b border-gray-200 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detalle de Compra</h1>
              <p className="text-gray-500 mt-1">
                Pedido <span className="font-semibold text-gray-700">#{compra.numero}</span> • {new Date(compra.fecha).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <OrderStatusBadge status={compra.estado_pago} size="md" />
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Shipping Section */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" /> Dirección de Entrega
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              {compra.calle ? (
                <p className="text-gray-700">
                  <span className="font-bold text-gray-900">{compra.calle} {compra.dir_numero}{compra.dir_departamento ? `, Depto ${compra.dir_departamento}` : ''}</span><br/>
                  <span className="text-sm text-gray-600">{compra.ciudad}, {compra.provincia}</span><br/>
                  <span className="text-sm text-gray-500 mt-1 block">CP {compra.codigo_postal}</span>
                </p>
              ) : (
                <p className="text-gray-500 italic text-sm">
                  No se registró una dirección de entrega para este pedido o fue retirado en sucursal.
                </p>
              )}
            </div>
          </section>

          {/* Items List */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Artículos del Pedido</h2>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="divide-y divide-gray-100">
                {compra.lineas.map((linea: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                      {linea.imagen_url ? (
                        <Image src={linea.imagen_url} alt={linea.producto_nombre} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sin foto</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-gray-900 truncate">{linea.producto_nombre}</h4>
                      {linea.talle && <p className="text-sm text-gray-500 mt-1">Talle: <span className="font-medium text-gray-700">{linea.talle}</span></p>}
                      <p className="text-sm text-gray-500 mt-1">Cantidad: <span className="font-medium text-gray-700">{linea.cantidad}</span></p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-gray-500 mb-1">Subtotal</p>
                      <p className="text-lg font-bold text-gray-900">${(Number(linea.precio_unitario) * linea.cantidad).toLocaleString('es-AR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Summary Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 sm:p-8">
          <div className="flex justify-between items-center max-w-sm ml-auto">
            <span className="text-gray-600 font-medium">Total abonado:</span>
            <span className="text-3xl font-black text-gray-900">${Number(compra.total).toLocaleString('es-AR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
