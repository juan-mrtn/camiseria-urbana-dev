import { getAdminMetricsAction } from "@/actions/admin.actions";
import { DollarSign, ShoppingCart, TrendingUp, Package } from "lucide-react";

export default async function MetricasPage() {
  const metrics = await getAdminMetricsAction();

  const maxUnidades = metrics.top_productos.length > 0 
    ? Math.max(...metrics.top_productos.map(p => p.unidades)) 
    : 1;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Métricas de Ventas</h1>
        <p className="text-gray-500">Resumen general de ingresos y rendimiento de productos.</p>
      </div>

      {/* Cards de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Ingresos Totales */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ingresos Totales</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900">
              ${metrics.total_ingresos.toLocaleString('es-AR')}
            </p>
          </div>
        </div>

        {/* Card 2: Ventas Concretadas */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ventas Concretadas</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900">
              {metrics.total_pedidos}
            </p>
          </div>
        </div>

        {/* Card 3: Ticket Promedio */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ticket Promedio</h3>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-gray-900">
              ${Math.round(metrics.ticket_promedio).toLocaleString('es-AR')}
            </p>
          </div>
        </div>
      </div>

      {/* Top Productos */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Top 3 Productos Más Vendidos</h2>
            <p className="text-sm text-gray-500">Productos con mayor volumen de unidades vendidas.</p>
          </div>
        </div>

        {metrics.top_productos.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl">
            Aún no hay ventas registradas para generar métricas.
          </div>
        ) : (
          <div className="space-y-6">
            {metrics.top_productos.map((producto, idx) => {
              const widthPercent = Math.max(5, Math.round((producto.unidades / maxUnidades) * 100));
              
              return (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-gray-800 text-lg">
                      {idx + 1}. {producto.producto}
                    </span>
                    <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {producto.unidades} uds.
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ingresos Mensuales (Gráfico de Barras CSS) */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Histórico de Ingresos</h2>
              <p className="text-sm text-gray-500">Evolución mensual de ventas confirmadas.</p>
            </div>
          </div>

          {metrics.ingresosMensuales.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl">
              No hay datos históricos mensuales.
            </div>
          ) : (
            <div className="flex items-end gap-2 h-64 mt-4">
              {metrics.ingresosMensuales.map((mesData, idx) => {
                const maxIngreso = Math.max(...metrics.ingresosMensuales.map(m => m.ingresos), 1);
                const heightPercent = Math.max(5, Math.round((mesData.ingresos / maxIngreso) * 100));
                
                return (
                  <div key={idx} className="flex-1 flex flex-col justify-end items-center group relative">
                    {/* Tooltip Hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded font-bold pointer-events-none whitespace-nowrap z-10">
                      ${mesData.ingresos.toLocaleString('es-AR')}
                    </div>
                    {/* Barra */}
                    <div 
                      className="w-full bg-indigo-100 hover:bg-indigo-400 rounded-t-md transition-all duration-500 ease-out cursor-pointer"
                      style={{ height: `${heightPercent}%` }}
                    />
                    {/* Etiqueta Mes */}
                    <span className="text-xs text-gray-500 mt-2 rotate-45 md:rotate-0 origin-left">
                      {mesData.mes}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Compradores */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-500">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Clientes Top</h2>
              <p className="text-sm text-gray-500">Los 5 usuarios con mayor volumen de compra.</p>
            </div>
          </div>

          {metrics.clientesTop.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl">
              Aún no hay clientes con compras confirmadas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 px-2 text-sm font-bold text-gray-500 uppercase">Cliente</th>
                    <th className="py-3 px-2 text-sm font-bold text-gray-500 uppercase text-center">Compras</th>
                    <th className="py-3 px-2 text-sm font-bold text-gray-500 uppercase text-right">Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {metrics.clientesTop.map((cliente, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2">
                        <p className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{cliente.nombre}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{cliente.email}</p>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 w-8 h-8 rounded-full font-bold text-sm">
                          {cliente.cantidad_compras}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right font-black text-indigo-600">
                        ${cliente.total_gastado.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
