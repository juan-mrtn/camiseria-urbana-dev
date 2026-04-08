// src/components/admin/StockForm.tsx
"use client";

import { registrarStockAction } from "@/actions/admin.actions";
import { useTransition } from "react";
import { Save, Loader2 } from "lucide-react";

export default function StockForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await registrarStockAction(formData);
        alert("¡Éxito! El stock se ha actualizado mediante el registro de compra.");
        (e.target as HTMLFormElement).reset(); // Limpia el formulario
      } catch (error) {
        alert("Error al registrar el ingreso. Verifica los IDs.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Proveedor</label>
        <input 
          type="text" name="proveedorId" required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="Ej: PROV-001" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">ID Variante</label>
        <input 
          type="text" name="varianteId" required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="Ej: V-P01-0" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Cantidad</label>
        <input 
          type="number" name="cantidad" min="1" required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Costo Unitario</label>
        <div className="relative">
          <span className="absolute left-4 top-2.5 text-gray-400">$</span>
          <input 
            type="number" name="costo" min="0" step="0.01" required 
            className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="md:col-span-2 pt-4">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Registrar Compra y Actualizar Stock
            </>
          )}
        </button>
      </div>
    </form>
  );
}