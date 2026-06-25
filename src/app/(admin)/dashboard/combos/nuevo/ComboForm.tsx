"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, Calendar, Plus, Trash2 } from "lucide-react";
import { createComboAction } from "@/actions/combos.actions";

interface AvailableVariant {
  variante_id: string;
  nombre: string;
  talle: string;
  color: string;
  precio: string;
}

interface ComboFormProps {
  availableVariants: AvailableVariant[];
}

export default function ComboForm({ availableVariants }: ComboFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [selectedItems, setSelectedItems] = useState<{ varianteId: string; cantidad: number }[]>([
    { varianteId: "", cantidad: 1 }
  ]);

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { varianteId: "", cantidad: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: "varianteId" | "cantidad", value: string | number) => {
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setSelectedItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    // Validate items
    const validItems = selectedItems.filter(item => item.varianteId !== "");
    if (validItems.length === 0) {
      setError("Debes seleccionar al menos un producto para el combo.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("selectedItems", JSON.stringify(validItems));

    startTransition(async () => {
      const res = await createComboAction(formData);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.error || "Ocurrió un error al crear el combo.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-indigo-600 font-bold hover:underline w-fit mb-6">
            <ChevronLeft className="w-4 h-4" /> Volver al Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-6 h-6 text-purple-600" />
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Crear Combo Especial
            </h1>
          </div>
          <p className="text-gray-500 font-medium">
            Configura un nuevo paquete de productos con vigencia temporal.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-bold">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Nombre del Combo</label>
              <input
                type="text"
                name="nombre"
                required
                placeholder="Ej: Pack Invierno x3"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Precio Total ($)</label>
              <input
                type="number"
                name="precio"
                required
                min="0"
                step="0.01"
                placeholder="Ej: 45000"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Descripción (Opcional)</label>
            <textarea
              name="descripcion"
              rows={3}
              placeholder="Detalla qué productos incluye este combo..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>

          <div className="border-t border-gray-100 pt-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-500" /> Items del Combo
            </h3>
            
            <div className="space-y-4">
              {selectedItems.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Producto Variante</label>
                    <select
                      value={item.varianteId}
                      onChange={(e) => updateItem(index, "varianteId", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all bg-white"
                      required
                    >
                      <option value="" disabled>Selecciona una variante...</option>
                      {availableVariants.map(variant => (
                        <option key={variant.variante_id} value={variant.variante_id}>
                          {variant.nombre} - Talle: {variant.talle || 'N/A'} - Color: {variant.color || 'N/A'} (${Number(variant.precio).toLocaleString('es-AR')})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-full sm:w-32 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => updateItem(index, "cantidad", parseInt(e.target.value) || 1)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={selectedItems.length === 1}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="mt-4 flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Añadir otro producto al combo
            </button>
          </div>

          <div className="border-t border-gray-100 pt-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" /> Vigencia Temporal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Fecha de Inicio</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Fecha de Fin</label>
                <input
                  type="date"
                  name="fecha_fin"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Si dejas las fechas vacías, el combo estará activo indefinidamente.
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              {isPending ? "Creando..." : "Crear Combo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
