"use client";

import { useState } from "react";
import { ShoppingBag, MapPin, Search, Calendar, User } from "lucide-react";
import OrderStatusBadge from "@/components/shop/OrderStatusBadge";

export interface VentaItem {
  producto: string;
  cantidad: number;
  talle: string;
  precio: number;
}

export interface VentaDetallada {
  compra_id: string;
  numero_pedido: string;
  fecha_creacion: Date | string;
  estado: string;
  total: number;
  direccion_envio: string;
  cliente_nombre: string;
  cliente_email: string;
  items: VentaItem[];
}

interface RecentSalesTableProps {
  ventas: VentaDetallada[];
}

export default function RecentSalesTable({ ventas = [] }: RecentSalesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVentas = ventas.filter((venta) => {
    const term = searchTerm.toLowerCase();
    return (
      venta.cliente_nombre?.toLowerCase().includes(term) ||
      venta.cliente_email?.toLowerCase().includes(term) ||
      venta.numero_pedido?.toLowerCase().includes(term) ||
      venta.direccion_envio?.toLowerCase().includes(term) ||
      venta.items.some((i) => i.producto.toLowerCase().includes(term))
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8 col-span-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#31572C]" />
            <h2 className="text-xl font-bold text-gray-900">Registro Auditado de Transacciones</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Historial de compras, productos solicitados, direcciones de entrega y estado del pago.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#31572C]/20 focus:border-[#31572C]"
          />
        </div>
      </div>

      {/* Table */}
      {filteredVentas.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white">
          <p className="font-semibold text-gray-700">No se encontraron transacciones</p>
          <p className="text-xs text-gray-400 mt-1">
            {searchTerm ? "Prueba cambiando el término de búsqueda" : "Aún no hay compras registradas en el sistema"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Fecha & ID</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Productos Comprados</th>
                <th className="py-3.5 px-4">Dirección de Envío</th>
                <th className="py-3.5 px-4 text-center">Estado del Pago</th>
                <th className="py-3.5 px-4 text-right">Monto Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredVentas.map((venta) => {
                const fechaFormatted = new Date(venta.fecha_creacion).toLocaleString("es-AR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr key={venta.compra_id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Fecha & ID */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-gray-900 text-xs bg-gray-100 px-2 py-0.5 rounded w-fit border border-gray-200">
                          #{venta.numero_pedido}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {fechaFormatted}
                        </span>
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {venta.cliente_nombre || "Cliente"}
                        </span>
                        <span className="text-xs text-gray-500 truncate max-w-[180px]">
                          {venta.cliente_email}
                        </span>
                      </div>
                    </td>

                    {/* Productos Comprados */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-col gap-1.5 max-w-[280px]">
                        {venta.items && venta.items.length > 0 ? (
                          venta.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-gray-50 border border-gray-100 rounded-lg p-1.5 flex items-center justify-between gap-2"
                            >
                              <span className="font-medium text-gray-800 truncate">
                                <span className="font-bold text-[#31572C] mr-1">{item.cantidad}x</span>
                                {item.producto}
                              </span>
                              <span className="text-[10px] text-gray-500 font-semibold bg-white px-1.5 py-0.5 rounded border border-gray-200 shrink-0">
                                Talle {item.talle}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">Sin detalle de productos</span>
                        )}
                      </div>
                    </td>

                    {/* Dirección de Envío */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-start gap-1.5 max-w-[220px]">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-600 leading-snug">
                          {venta.direccion_envio}
                        </span>
                      </div>
                    </td>

                    {/* Estado del Pago */}
                    <td className="py-4 px-4 align-top text-center">
                      <OrderStatusBadge status={venta.estado} size="sm" />
                    </td>

                    {/* Monto Total */}
                    <td className="py-4 px-4 align-top text-right">
                      <span className="font-black text-[#31572C] text-base">
                        ${venta.total.toLocaleString("es-AR")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
