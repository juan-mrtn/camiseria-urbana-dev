// src/app/(admin)/dashboard/productos/page.tsx
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminRepository } from "@/repositories/admin.repository";
import { Plus, Edit, Trash2, PackageSearch } from "lucide-react";

export default async function GestionProductosPage() {
  const session = await auth();

  if (!session || session.user?.rol !== 'admin') {
    redirect("/");
  }

  // Traemos los datos de la BD
  const productos = await AdminRepository.getProductosParaDashboard();

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Gestión de Productos</h1>
          <p className="text-gray-500 text-sm mt-1">Administra el catálogo, precios y variantes.</p>
        </div>
        
        {/* Este botón enlaza a la página de ProductForm que ya armaste */}
        <Link 
          href="/dashboard/productos/nuevo" 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          Cargar Producto
        </Link>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {productos.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <PackageSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No hay productos cargados</h3>
            <p className="text-gray-500 mb-6">Comienza agregando tu primer producto al catálogo.</p>
            <Link href="/dashboard/productos/nuevo" className="text-indigo-600 font-bold hover:underline">
              Crear nuevo producto &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="p-4 pl-6">Producto</th>
                  <th className="p-4">Código</th>
                  <th className="p-4 text-center">Variantes</th>
                  <th className="p-4 text-center">Stock Total</th>
                  <th className="p-4 text-right">Precio Base</th>
                  <th className="p-4 pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productos.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-4 pl-6 font-bold text-gray-900">{prod.nombre}</td>
                    <td className="p-4 text-gray-500 text-sm font-mono">{prod.codigo}</td>
                    <td className="p-4 text-center">
                      <span className="bg-gray-100 text-gray-700 py-1 px-3 rounded-full text-xs font-bold">
                        {prod.cantidad_variantes}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`py-1 px-3 rounded-full text-xs font-bold ${
                        Number(prod.stock_total) > 10 ? 'bg-green-100 text-green-700' : 
                        Number(prod.stock_total) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {prod.stock_total}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-gray-900">
                      ${Number(prod.precio_base).toLocaleString('es-AR')}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
