"use client";

import { crearProductoBaseAction } from "@/actions/admin.actions";
import { useTransition } from "react";
import { Save, Loader2, Tag } from "lucide-react";

export default function BaseProductForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await crearProductoBaseAction(formData);
        alert("¡Éxito! Producto Base creado correctamente.");
        (e.target as HTMLFormElement).reset();
        // The page action will revalidate, making the new product appear in the dropdown
      } catch (error: any) {
        console.error(error);
        alert("Error al crear el producto base: " + error.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Tag className="w-5 h-5 text-indigo-600" /> Crear Producto Base
        </h2>
        <p className="text-sm text-gray-500">Registra un nuevo producto (ej: Camisa Taverniti) antes de agregarle talles, colores o stock.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Nombre del Producto</label>
          <input 
            type="text" name="nombre" required 
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Ej: Camisa Taverniti"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Código interno (SKU)</label>
          <input 
            type="text" name="codigo" required 
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Ej: TV-001"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Descripción</label>
          <input 
            type="text" name="descripcion" required 
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Ej: Camisa 100% algodón"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          type="submit" 
          disabled={isPending}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md disabled:opacity-50"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
          ) : (
            <><Save className="w-4 h-4" /> Crear Producto Base</>
          )}
        </button>
      </div>
    </form>
  );
}
