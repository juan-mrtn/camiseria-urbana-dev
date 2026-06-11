// src/components/admin/PromoForm.tsx
"use client";

import { getAllVariantesAction } from "@/actions/admin.actions";
import { crearCampanaPromocional } from "@/actions/admin-promos.actions";
import { useTransition, useState, useEffect } from "react";
import { Save, Loader2, Tag } from "lucide-react";

export default function PromoForm() {
  const [isPending, startTransition] = useTransition();
  const [variantes, setVariantes] = useState<{id: string, nombre: string, talle: string, label: string}[]>([]);
  
  // Multi-select state
  const [selectedVarianteIds, setSelectedVarianteIds] = useState<string[]>([]);
  const [tipoPromo, setTipoPromo] = useState<'descuento' | '2x1'>('descuento');

  useEffect(() => {
    getAllVariantesAction()
      .then(setVariantes)
      .catch(console.error);
  }, []);

  const handleToggleVariante = (id: string) => {
    setSelectedVarianteIds(prev => 
      prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedVarianteIds.length === variantes.length) {
      setSelectedVarianteIds([]); // deselect all
    } else {
      setSelectedVarianteIds(variantes.map(v => v.id)); // select all
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedVarianteIds.length === 0) {
      alert("Debes seleccionar al menos una variante para aplicar la promoción.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const promoData = {
      tipo: tipoPromo,
      descripcion: formData.get("descripcion") as string,
      fechaInicio: formData.get("fechaInicio") as string,
      fechaFin: formData.get("fechaFin") as string,
      descuento: tipoPromo === 'descuento' ? parseFloat(formData.get("descuento") as string) : undefined
    };

    startTransition(async () => {
      try {
        await crearCampanaPromocional(promoData, selectedVarianteIds);
        alert("¡Éxito! La campaña promocional ha sido activada.");
        (e.target as HTMLFormElement).reset();
        setSelectedVarianteIds([]);
      } catch (error: any) {
        console.error(error);
        alert(error.message || "Error al registrar la campaña.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mt-8">
      <div className="md:col-span-2 mb-2">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Tag className="w-5 h-5 text-indigo-600" /> Crear Promoción (PBI-28)
        </h2>
        <p className="text-sm text-gray-500">Configura descuentos o promociones 2x1 y aplícalos a las variantes seleccionadas.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Tipo de Promoción</label>
        <select 
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
            placeholder="Ej: 15"
          />
        </div>
      )}

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-bold text-gray-700">Descripción / Motivo</label>
        <input 
          type="text" name="descripcion" required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="Ej: Oferta de Navidad"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Fecha de Inicio</label>
        <input 
          type="date" name="fechaInicio" required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Fecha de Fin</label>
        <input 
          type="date" name="fechaFin" required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-bold text-gray-700">Variantes Aplicables ({selectedVarianteIds.length} seleccionadas)</label>
          <button type="button" onClick={handleSelectAll} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
            {selectedVarianteIds.length === variantes.length ? "Deseleccionar Todas" : "Seleccionar Todas"}
          </button>
        </div>
        
        <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
          {variantes.map(v => (
            <label key={v.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input 
                type="checkbox" 
                checked={selectedVarianteIds.includes(v.id)}
                onChange={() => handleToggleVariante(v.id)}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">{v.label}</span>
            </label>
          ))}
          {variantes.length === 0 && (
            <p className="text-sm text-gray-500 p-2 text-center">Cargando variantes...</p>
          )}
        </div>
      </div>

      <div className="md:col-span-2 pt-4 border-t border-gray-100">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          {isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Activando Promoción...</>
          ) : (
            <><Save className="w-5 h-5" /> Activar Promoción Masiva</>
          )}
        </button>
      </div>
    </form>
  );
}
