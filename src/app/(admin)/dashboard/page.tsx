// src/app/(admin)/dashboard/page.tsx
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import StockForm from "@/components/admin/StockForm";
import Link from "next/link";
import { Package, PlusCircle, LayoutDashboard, Truck } from "lucide-react";

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
            
            <Link href="/admin/productos/nuevo" 
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group">
              <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-600 transition-colors">
                <PlusCircle className="w-6 h-6 text-indigo-600 group-hover:text-white" />
              </div>
              <div>
                <span className="block font-bold text-gray-900">Cargar Producto</span>
                <span className="text-xs text-gray-500">PBI-23: Crear nuevas variantes</span>
              </div>
            </Link>

            <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl opacity-60">
              <div className="p-3 bg-gray-50 rounded-lg">
                <Truck className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <span className="block font-bold text-gray-400">Proveedores</span>
                <span className="text-xs text-gray-400">Próximamente</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Gestión de Stock (PBI-24) */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Gestión de Inventario (PBI-24)
              </h2>
            </div>
            
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