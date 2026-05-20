"use client";

import { useTransition } from "react";
import { crearProveedorAction } from "@/actions/admin.actions";
import { Save, Loader2, User } from "lucide-react";

export default function SupplierForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await crearProveedorAction(formData);
        alert("¡Éxito! El proveedor se ha registrado correctamente.");
        (e.target as HTMLFormElement).reset();
      } catch (error) {
        alert("Error al crear el proveedor.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
      <div className="md:col-span-2 mb-2">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5" /> 1. Registrar Nuevo Proveedor (Opcional)
        </h2>
        <p className="text-sm text-gray-500">Crea un proveedor si aún no existe en el sistema.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Nombre del Proveedor</label>
        <input 
          type="text" name="nombre" required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="Ej: TexSur S.A." 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Contacto (Email/Teléfono)</label>
        <input 
          type="text" name="contacto" required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="Ej: contacto@texsur.com" 
        />
      </div>

      <div className="md:col-span-2 pt-2">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          {isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</>
          ) : (
            <><Save className="w-5 h-5" /> Registrar Proveedor</>
          )}
        </button>
      </div>
    </form>
  );
}
