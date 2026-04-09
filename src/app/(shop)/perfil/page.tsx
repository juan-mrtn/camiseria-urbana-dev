import Link from "next/link";
import { ChevronRight, Edit2, Trash2, Home, Building2, Star, RefreshCw, Plus, Save, Mail, Check } from "lucide-react";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import AddressSection from "@/components/perfil/AddressSection";
import { UsuarioRepository } from "@/repositories/usuario.repository";
import { DireccionRepository } from "@/repositories/direccion.repository";
import  PreferencesSection from "@/components/perfil/PreferencesSection";


export default async function ProfilePage() {
  const session = await auth();

  // Verificamos sesión e ID inyectado por el callback de auth.ts
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Ejecutamos consultas en paralelo para máxima velocidad
  const [usuarioDb, direcciones] = await Promise.all([
    UsuarioRepository.getByEmail(session.user.email!),
    DireccionRepository.getByUsuarioId(session.user.id)
  ]);

  if (!usuarioDb) redirect("/login");
  
  return (
    <div className="max-w-5xl mx-auto flex flex-col pb-20">
      
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600 gap-2 mb-6 mt-4 font-medium">
        <Link href="/" className="hover:text-gray-900">Inicio</Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span>Mi Cuenta</span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900">Mi Perfil</span>
      </div>

      {/* Cabecera Principal */}
      <div className="border border-gray-200 rounded-xl p-5 mb-6 bg-white flex flex-col md:flex-row md:items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Mi información personal</h1>
        <p className="text-gray-600 text-sm mt-1 md:mt-0 font-medium">Administra tus datos, direcciones y seguridad</p>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* SECCIÓN 1: Datos personales */}
        <section className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Datos personales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
              <input 
                type="text" 
                defaultValue={usuarioDb.nombre} 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none font-medium"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input 
                type="email" 
                defaultValue={usuarioDb.email} 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none font-medium"
                readOnly
              />
            </div>
            
          </div>
          
        </section>

        {/* SECCIÓN 2: Direcciones de envío */}
        <AddressSection direcciones={direcciones} />

        {/* SECCIÓN 3: Seguridad
        <section className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Seguridad</h2>
          <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
            <RefreshCw className="w-4 h-4" />
            Cambiar contraseña
          </button>
        </section> */}

        {/* SECCIÓN 4: Preferencias */}
        <section className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm mt-6">
        
          {/* Aquí insertas el nuevo componente interactivo */}
          <PreferencesSection suscrito={usuarioDb.suscrito} />
      </section>

      </div>
    </div>
  );
}