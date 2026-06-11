import { BannerRepository } from "@/repositories/banner.repository";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, ArrowLeft, Image as ImageIcon } from "lucide-react";
import DeleteBannerButton from "./DeleteBannerButton";

export default async function BannersPage() {
  const session = await auth();

  if (!session || session.user?.rol !== 'admin') {
    redirect("/");
  }

  const banners = await BannerRepository.getAllBanners();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Gestión de Banners
            </h1>
          </div>
          <p className="text-gray-500 font-medium ml-12">
            Administra los banners principales de la landing page.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Banners Activos</h2>
          <Link
            href="/dashboard/banners/crear"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Nuevo Banner
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-gray-100">
            {banners.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                No hay banners configurados.
              </div>
            ) : (
              banners.map((banner) => (
                <div key={banner.id} className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:bg-gray-50/50 transition-colors">
                  <div className="relative w-full md:w-48 h-28 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                    {banner.imagen_url ? (
                      <Image 
                        src={banner.imagen_url} 
                        alt={banner.titulo} 
                        fill 
                        sizes="200px"
                        className="object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-gray-900">{banner.titulo}</h3>
                      {!banner.activo && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-2">{banner.subtitulo}</p>
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                      <span>Botón: {banner.boton_texto}</span>
                      <span>Orden: {banner.orden}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <DeleteBannerButton id={banner.id} totalCount={banners.length} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-4 text-center">
          Recuerda: Siempre debe haber al menos un banner activo en el sistema para que la tienda funcione correctamente.
        </p>
      </div>
    </div>
  );
}
