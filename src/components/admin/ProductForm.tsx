"use client";

import { useState, useTransition } from "react";
import { crearProductoAction } from "@/actions/admin.actions";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import type { NuevaVarianteDTO, NuevoProductoDTO } from "@/repositories/admin.repository";

export default function ProductForm() {
  const [isPending, startTransition] = useTransition();

  // Estado para el producto base
  const [producto, setProducto] = useState({
    nombre: "", descripcion: "", codigo: ""
  });

  // Estado para la lista dinámica de variantes
  const [variantes, setVariantes] = useState<NuevaVarianteDTO[]>([
    { talle: "", color: "", material: "", precio: 0, imagenUrl: "" }
  ]);

  // Función para agregar una nueva variante vacía a la lista
  const agregarVariante = () => {
    setVariantes([...variantes, { talle: "", color: "", material: "", precio: 0, imagenUrl: "" }]);
  };

  // Función para eliminar una variante de la lista
  const eliminarVariante = (index: number) => {
    const nuevas = variantes.filter((_, i) => i !== index);
    setVariantes(nuevas);
  };

  // Función para actualizar los datos de una variante específica
  const actualizarVariante = (index: number, campo: keyof NuevaVarianteDTO, valor: string | number) => {
    const nuevas = [...variantes];
    nuevas[index] = { ...nuevas[index], [campo]: valor };
    setVariantes(nuevas);
  };

  // Manejador del envío (Submit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Armamos el objeto completo DTO
    const datosFinales: NuevoProductoDTO = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      codigo: producto.codigo,
      variantes: variantes
    };

    startTransition(async () => {
      try {
        await crearProductoAction(datosFinales);
        alert("Producto y variantes creados con éxito.");
        // Redirigir o limpiar formulario aquí
      } catch (error) {
        alert("Ocurrió un error al crear el producto.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-4xl mx-auto">
      
      {/* SECCIÓN 1: DATOS DEL PRODUCTO BASE */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">1. Datos del Producto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Nombre del Producto</label>
            <input required type="text" value={producto.nombre} onChange={e => setProducto({...producto, nombre: e.target.value})} className="border p-2.5 rounded-lg" placeholder="Ej: Camisa Oxford" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Código Base (Slug/Referencia)</label>
            <input required type="text" value={producto.codigo} onChange={e => setProducto({...producto, codigo: e.target.value})} className="border p-2.5 rounded-lg" placeholder="Ej: CAM-OXF-01" />
          </div>
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Descripción</label>
            <textarea required value={producto.descripcion} onChange={e => setProducto({...producto, descripcion: e.target.value})} className="border p-2.5 rounded-lg min-h-[100px]" placeholder="Detalles de la prenda..." />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: VARIANTES (DINÁMICO) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">2. Variantes del Producto</h2>
          <button type="button" onClick={agregarVariante} className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-lg">
            <Plus className="w-4 h-4" /> Agregar Variante
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {variantes.map((variante, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-xl bg-gray-50 relative">
              
              {/* Botón para eliminar variante */}
              {variantes.length > 1 && (
                <button type="button" onClick={() => eliminarVariante(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <h3 className="font-bold text-gray-700 mb-3">Variante #{index + 1}</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Talle</label>
                  <input required type="text" value={variante.talle} onChange={e => actualizarVariante(index, 'talle', e.target.value)} className="border p-2 rounded-md" placeholder="Ej: L" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Color</label>
                  <input required type="text" value={variante.color} onChange={e => actualizarVariante(index, 'color', e.target.value)} className="border p-2 rounded-md" placeholder="Ej: Azul" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Material</label>
                  <input required type="text" value={variante.material} onChange={e => actualizarVariante(index, 'material', e.target.value)} className="border p-2 rounded-md" placeholder="Ej: Algodón" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Precio ($)</label>
                  <input required type="number" min="0" value={variante.precio} onChange={e => actualizarVariante(index, 'precio', parseFloat(e.target.value))} className="border p-2 rounded-md" />
                </div>
                <div className="col-span-2 md:col-span-1 flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">URL Imagen</label>
                  <input type="text" value={variante.imagenUrl} onChange={e => actualizarVariante(index, 'imagenUrl', e.target.value)} className="border p-2 rounded-md" placeholder="https://..." />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTÓN GUARDAR (PBI-23) */}
      <button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 text-lg">
        {isPending ? (
          <><Loader2 className="w-6 h-6 animate-spin" /> Creando Producto Completo...</>
        ) : (
          <><Save className="w-6 h-6" /> Guardar Producto y Variantes</>
        )}
      </button>

    </form>
  );
}