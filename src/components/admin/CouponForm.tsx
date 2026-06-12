"use client";

import { useTransition, useState } from "react";
import { crearCuponAction } from "@/actions/admin.actions";
import { Save, Loader2, Tag } from "lucide-react";

export default function CouponForm() {
  const [isPending, startTransition] = useTransition();
  const [tipoPromo, setTipoPromo] = useState<'descuento' | '2x1'>('descuento');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const fechaInicio = formData.get("fecha_inicio") as string;
    const fechaFin = formData.get("fecha_fin") as string;

    if (new Date(fechaFin) < new Date(fechaInicio)) {
      setErrorMsg("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await crearCuponAction(formData);
        if (res && !res.success) {
          setErrorMsg(res.error || "Ocurrió un error al crear el cupón.");
        } else {
          alert("¡Éxito! El cupón ha sido creado correctamente.");
          (e.target as HTMLFormElement).reset();
          setTipoPromo('descuento');
        }
      } catch (error: any) {
        console.error(error);
        setErrorMsg("Error al registrar el cupón.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mt-8">
      <div className="md:col-span-2 mb-2">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Tag className="w-5 h-5 text-indigo-600" /> Crear Cupón de Descuento (PBI-27)
        </h2>
        <p className="text-sm text-gray-500">Crea nuevos cupones o promociones generales para la tienda.</p>
      </div>

      {errorMsg && (
        <div className="md:col-span-2 bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Código de Cupón (ID)</label>
        <input 
          type="text" name="id" required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase"
          placeholder="Ej: VERANO2026"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Tipo de Cupón</label>
        <select 
          name="tipo"
          value={tipoPromo}
          onChange={(e) => setTipoPromo(e.target.value as 'descuento' | '2x1')}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
        >
          <option value="descuento">Descuento Porcentual</option>
          <option value="2x1">Promoción 2x1</option>
        </select>
      </div>

      {tipoPromo === 'descuento' && (
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Porcentaje de Descuento (%)</label>
          <input 
            type="number" name="descuento" min="1" max="99" required 
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Ej: 20"
          />
        </div>
      )}

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-bold text-gray-700">Descripción</label>
        <input 
          type="text" name="descripcion" required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="Ej: Descuento especial por fin de temporada"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Fecha de Inicio</label>
        <input 
          type="date" name="fecha_inicio" required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Fecha de Fin</label>
        <input 
          type="date" name="fecha_fin" required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="md:col-span-2 pt-4 border-t border-gray-100">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          {isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Creando Cupón...</>
          ) : (
            <><Save className="w-5 h-5" /> Guardar Cupón</>
          )}
        </button>
      </div>
    </form>
  );
}
