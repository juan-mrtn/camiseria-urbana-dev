// src/app/(admin)/dashboard/page.tsx
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import StockForm from "@/components/admin/StockForm";
import SupplierForm from "@/components/admin/SupplierForm";
import Link from "next/link";
import { Package, PlusCircle, LayoutDashboard, Truck, BarChart3, ListCollapse, Tag, Ticket, ChevronLeft } from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();

  // Protección de ruta: Solo admins
  if (!session || session.user?.rol !== 'admin') {
    redirect("/"); // O a una página de "No autorizado"
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header del Dashboard */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/" className="flex items-center gap-2 text-indigo-600 font-bold hover:underline w-fit mb-6">
            <ChevronLeft className="w-4 h-4" /> Volver a la Tienda
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="w-6 h-6 text-indigo-600" />
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Panel de Control
            </h1>
          </div>
          <p className="text-gray-500 font-medium">
            Bienvenido, {session.user.name}. Gestiona el inventario y productos de la tienda.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Acciones Rápidas */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
              Accesos Rápidos
            </h2>
            <Link href="/dashboard/productos" 
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group">
              <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-600 transition-colors">
                <ListCollapse className="w-6 h-6 text-indigo-600 group-hover:text-white" />
              </div>
              <div>
                <span className="block font-bold text-gray-900">Catálogo de Productos</span>
                <span className="text-xs text-gray-500">Ver y editar inventario</span>
              </div>
            </Link>

            <Link href="/dashboard/productos/nuevo" 
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group">
              <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-600 transition-colors">
                <PlusCircle className="w-6 h-6 text-indigo-600 group-hover:text-white" />
              </div>
              <div>
                <span className="block font-bold text-gray-900">Alta de Productos</span>
                <span className="text-xs text-gray-500">Producto base y variantes</span>
              </div>
            </Link>

            <Link href="/dashboard/banners" 
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group">
              <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-600 transition-colors">
                <LayoutDashboard className="w-6 h-6 text-indigo-600 group-hover:text-white" />
              </div>
              <div>
                <span className="block font-bold text-gray-900">Banners Principales</span>
                <span className="text-xs text-gray-500">Promociones y lanzamientos</span>
              </div>
            </Link>

            <Link href="/dashboard/metricas" 
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group">
              <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-600 transition-colors">
                <BarChart3 className="w-6 h-6 text-indigo-600 group-hover:text-white" />
              </div>
              <div>
                <span className="block font-bold text-gray-900">Métricas de Ventas</span>
                <span className="text-xs text-gray-500">Analítica básica de ingresos</span>
              </div>
            </Link>

            <Link href="/dashboard/promociones" 
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group">
              <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-600 transition-colors">
                <Tag className="w-6 h-6 text-indigo-600 group-hover:text-white" />
              </div>
              <div>
                <span className="block font-bold text-gray-900">Gestión de Promos</span>
                <span className="text-xs text-gray-500">Descuentos por variante</span>
              </div>
            </Link>

            <Link href="/dashboard/cupones" 
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group">
              <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-600 transition-colors">
                <Ticket className="w-6 h-6 text-indigo-600 group-hover:text-white" />
              </div>
              <div>
                <span className="block font-bold text-gray-900">Crear Cupón</span>
                <span className="text-xs text-gray-500">Descuentos y 2x1 globales</span>
              </div>
            </Link>
          </div>

          {/* Columna Derecha: Gestión de Stock (PBI-24) */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Gestión de Inventario (PBI-24)
              </h2>
            </div>
            <SupplierForm />

            {/* Aquí inyectamos el componente que creamos anteriormente */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-gray-900 text-lg">Entrada de Mercadería</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Registra los remitos de compra para actualizar el stock dinámicamente.
                </p>
              </div>
              <div className="p-6">
                <StockForm />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}