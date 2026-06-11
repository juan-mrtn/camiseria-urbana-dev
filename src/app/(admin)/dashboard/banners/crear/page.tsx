import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BannerForm from "@/components/admin/BannerForm";
import { db } from "@/lib/db";

export default async function CrearBannerPage() {
  const session = await auth();

  if (!session || session.user?.rol !== 'admin') {
    redirect("/");
  }

  // Obtenemos todos los productos base para poder seleccionarlos en el banner
  const query = `
    SELECT p.id, p.nombre, p.codigo,
           (SELECT pv.imagen_url FROM producto_variante pv WHERE pv.producto_id = p.id AND pv.imagen_url IS NOT NULL LIMIT 1) as imagen_url
    FROM producto p
    ORDER BY p.nombre ASC
  `;
  const result = await db.query(query);
  const productos = result.rows;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboard/banners" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Crear Nuevo Banner
            </h1>
          </div>
          <p className="text-gray-500 font-medium ml-12">
            Configura el banner principal y selecciona los productos que formarán la colección.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <BannerForm productosDisponibles={productos} />
      </div>
    </div>
  );
}
