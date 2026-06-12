import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import PromoForm from "@/components/admin/PromoForm";
import { Tag, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function PromocionesPage() {
  const session = await auth();
  if (!session || session.user?.rol !== 'admin') redirect("/");

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
      <div className="max-w-4xl mx-auto px-4">
        <PromoForm />
      </div>
    </div>
  );
}
