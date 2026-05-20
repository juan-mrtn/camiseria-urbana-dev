"use client";

import { registrarStockAction, getProveedoresAction, getAllVariantesAction } from "@/actions/admin.actions";
import { useTransition, useState, useEffect } from "react";
import { Save, Loader2, PackagePlus } from "lucide-react";

export default function StockForm() {
  const [isPending, startTransition] = useTransition();

  const [proveedores, setProveedores] = useState<{id: string, nombre: string}[]>([]);
  const [variantes, setVariantes] = useState<{nombre: string, talle: string, label: string}[]>([]);
  const [selectedVariante, setSelectedVariante] = useState("");

  useEffect(() => {
    getProveedoresAction()
      .then(setProveedores)
      .catch((err) => {
        console.error("Error al cargar proveedores:", err);
        alert("Error al cargar proveedores: " + err.message);
      });
      
    getAllVariantesAction()
      .then(setVariantes)
      .catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (selectedVariante) {
      const v = JSON.parse(selectedVariante);
      formData.set("nombreProducto", v.nombre);
      formData.set("talle", v.talle);
    }
    
    startTransition(async () => {
      try {
        await registrarStockAction(formData);
        alert("¡Éxito! La compra se ha registrado correctamente.");
        (e.target as HTMLFormElement).reset();
      } catch (error: any) {
        console.error(error);
        alert(error.message || "Error al registrar la compra. Verifica que el producto y talle existan.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="md:col-span-2 mb-2">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <PackagePlus className="w-5 h-5 text-indigo-600" /> Ingreso de Mercadería (Stock)
        </h2>
        <p className="text-sm text-gray-500">Selecciona el proveedor y la variante de producto específica para registrar una compra. Este ingreso sumará al stock disponible inmediatamente.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Proveedor</label>
        <select 
          name="proveedorId" required defaultValue=""
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
        >
          <option value="" disabled>Selecciona un proveedor...</option>
          {proveedores.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-bold text-gray-700">Variante del Producto</label>
        <select 
          required 
          value={selectedVariante}
          onChange={(e) => setSelectedVariante(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
        >
          <option value="" disabled>Selecciona la variante que ingresa al stock...</option>
          {variantes.map((v, i) => (
            <option key={i} value={JSON.stringify({ nombre: v.nombre, talle: v.talle })}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 md:col-span-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Cantidad (Unidades Totales)</label>
          <input 
            type="number" name="cantidad" min="1" required 
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Costo Unitario</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">$</span>
            <input 
              type="number" name="costoUnitario" min="0" step="0.01" required 
              className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="md:col-span-2 pt-4">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          {isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Procesando Compra...</>
          ) : (
            <><Save className="w-5 h-5" /> Registrar Compra Mayorista</>
          )}
        </button>
      </div>
    </form>
  );
}