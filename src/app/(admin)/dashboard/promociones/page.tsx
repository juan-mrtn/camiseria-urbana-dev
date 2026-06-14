import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import PromoForm from "@/components/admin/PromoForm";
import { Tag, ChevronLeft, Percent } from "lucide-react";
import Link from "next/link";
import { getPromocionesAction } from "@/actions/admin.actions";

export default async function PromocionesPage() {
  const session = await auth();
  if (!session || session.user?.rol !== 'admin') redirect("/");

  const promociones = await getPromocionesAction();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-indigo-600 font-bold hover:underline w-fit mb-6">
            <ChevronLeft className="w-4 h-4" /> Volver al Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-6 h-6 text-indigo-600" />
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Gestión de Promociones
            </h1>
          </div>
          <p className="text-gray-500 font-medium">
            Configura descuentos y 2x1 para variantes específicas (PBI-28).
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Creación */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Asignar Promoción</h2>
              <PromoForm />
            </div>
          </div>

          {/* Historial de Promociones */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Promociones</h2>
            <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
              {promociones.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Aún no hay promociones creadas. Crea la primera usando el formulario de cupones.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
                        <th className="p-4 font-bold">Código / ID</th>
                        <th className="p-4 font-bold">Tipo</th>
                        <th className="p-4 font-bold">Vigencia</th>
                        <th className="p-4 font-bold text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {promociones.map((promo: any) => {
                        const isActivo = promo.estado === 'Activo';
                        const isVencido = promo.estado === 'Vencido';
                        const isProgramado = promo.estado === 'Programado';

                        return (
                          <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-gray-900 font-mono">{promo.id}</div>
                              <div className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate" title={promo.descripcion}>
                                {promo.descripcion}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-medium text-xs">
                                {promo.tipo === 'descuento' ? (
                                  <><Percent className="w-3.5 h-3.5" /> {(Number(promo.descuento) * 100).toFixed(0)}% OFF</>
                                ) : (
                                  <><Tag className="w-3.5 h-3.5" /> 2x1</>
                                )}
                              </span>
                            </td>
                            <td className="p-4 text-gray-600">
                              <div className="flex flex-col text-xs gap-1">
                                <span><strong className="text-gray-900">Desde:</strong> {new Date(promo.fecha_inicio).toLocaleDateString('es-AR', { timeZone: 'UTC' })}</span>
                                <span><strong className="text-gray-900">Hasta:</strong> {new Date(promo.fecha_fin).toLocaleDateString('es-AR', { timeZone: 'UTC' })}</span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold text-xs ${
                                isActivo ? 'bg-green-100 text-green-700' :
                                isVencido ? 'bg-gray-100 text-gray-600' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {promo.estado}
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
          </div>
        </div>
      </div>
    </div>
  );
}
