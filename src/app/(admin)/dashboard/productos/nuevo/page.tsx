// src/app/(admin)/productos/nuevo/page.tsx
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NuevoProductoPage() {
  const session = await auth();

  // Validación de seguridad estricta
  if (!session || session.user?.rol !== 'admin') {
    redirect("/"); 
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-8">
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-indigo-600 font-bold hover:underline w-fit">
          <ChevronLeft className="w-4 h-4" /> Volver al Dashboard
        </Link>
        <h1 className="text-3xl font-black text-gray-900 mt-4">Cargar Nuevo Producto</h1>
        <p className="text-gray-500">PBI-23: Define la información base del producto y añade todas sus variantes de talle y color.</p>
      </div>

      <div className="px-4">
        {/* Renderizamos el formulario que maneja todas las tablas a la vez */}
        <ProductForm />
      </div>
    </div>
  );
}