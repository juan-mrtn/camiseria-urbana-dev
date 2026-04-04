import Link from "next/link";
import { ChevronRight, Edit2, Trash2, Home, Building2, Star, RefreshCw, Plus, Save, Mail, Check } from "lucide-react";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import AddressSection from "@/components/perfil/AddressSection";

export default async function ProfilePage() {
  // const session = await auth();

  // if (!session || !session.user) {
  //   redirect("/login");
  // }

  // Mocks de datos estructurados para simular la vista
  const usuario = {
    nombre:  "Juan M.",
    email:  "juan@email.com",
    telefono: "+54 345 123-4567"
  };

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
                defaultValue={usuario.nombre} 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input 
                type="email" 
                defaultValue={usuario.email} 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                readOnly
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
              <input 
                type="tel" 
                defaultValue={usuario.telefono} 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                readOnly
              />
            </div>
          </div>
          
          <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
            <Edit2 className="w-4 h-4" />
            Editar información
          </button>
        </section>

        {/* SECCIÓN 2: Direcciones de envío */}
        <AddressSection />

        {/* SECCIÓN 3: Seguridad */}
        <section className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Seguridad</h2>
          <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
            <RefreshCw className="w-4 h-4" />
            Cambiar contraseña
          </button>
        </section>

        {/* SECCIÓN 4: Preferencias */}
        <section className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Preferencias</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-700" />
                <span className="font-bold text-gray-900">Suscripción a newsletter</span>
              </div>
              <p className="text-sm text-gray-600 mt-2 font-medium">Recibe novedades, promociones y descuentos exclusivos en tu correo.</p>
            </div>
            <button className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors text-sm shadow-sm whitespace-nowrap">
              <Check className="w-4 h-4" />
              Sí, quiero recibir ofertas
            </button>
          </div>
        </section>

        {/* BOTÓN FINAL */}
        <div className="flex justify-end mt-2">
          <button className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md">
            <Save className="w-5 h-5" />
            Guardar cambios
          </button>
        </div>

      </div>
    </div>
  );
}