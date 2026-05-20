"use client";

import { useState, useTransition, useEffect } from "react";
import { crearProductoAction, getProductosBaseAction, getUnallocatedStockAction } from "@/actions/admin.actions";
import { Plus, Trash2, Save, Loader2, Image as ImageIcon, CheckCircle, Package } from "lucide-react";

interface VarianteFormState {
  talle: string;
  color: string;
  material: string;
  precio: number;
  imagenFiles: File[];
  imagenPreviews: string[];
}

export default function ProductForm() {
  const [isPending, startTransition] = useTransition();

  const [productos, setProductos] = useState<{id: string, nombre: string, codigo: string}[]>([]);
  const [selectedProductoId, setSelectedProductoId] = useState("");
  const [unallocatedStock, setUnallocatedStock] = useState<number | null>(null);

  const [variantes, setVariantes] = useState<VarianteFormState[]>([
    { talle: "", color: "", material: "", precio: 0, imagenFiles: [], imagenPreviews: [] }
  ]);

  useEffect(() => {
    getProductosBaseAction().then(setProductos).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedProductoId) {
      getUnallocatedStockAction(selectedProductoId).then(setUnallocatedStock).catch(console.error);
    } else {
      setUnallocatedStock(null);
    }
  }, [selectedProductoId]);

  const agregarVariante = () => {
    setVariantes([...variantes, { talle: "", color: "", material: "", precio: 0, imagenFiles: [], imagenPreviews: [] }]);
  };

  const eliminarVariante = (index: number) => {
    const nuevas = variantes.filter((_, i) => i !== index);
    setVariantes(nuevas);
  };

  const actualizarVariante = (index: number, campo: keyof VarianteFormState, valor: any) => {
    const nuevas = [...variantes];
    nuevas[index] = { ...nuevas[index], [campo]: valor };
    setVariantes(nuevas);
  };

  const handleMultipleImagesChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const nuevas = [...variantes];
      const prevFiles = nuevas[index].imagenFiles;
      const prevPreviews = nuevas[index].imagenPreviews;
      
      const newFiles = [...prevFiles, ...files];
      const newPreviews = [...prevPreviews, ...files.map(f => URL.createObjectURL(f))];
      
      nuevas[index] = { ...nuevas[index], imagenFiles: newFiles, imagenPreviews: newPreviews };
      setVariantes(nuevas);
    }
  };

  const removeImage = (varianteIndex: number, imageIndex: number) => {
    const nuevas = [...variantes];
    const prevFiles = [...nuevas[varianteIndex].imagenFiles];
    const prevPreviews = [...nuevas[varianteIndex].imagenPreviews];

    prevFiles.splice(imageIndex, 1);
    prevPreviews.splice(imageIndex, 1);

    nuevas[varianteIndex] = { ...nuevas[varianteIndex], imagenFiles: prevFiles, imagenPreviews: prevPreviews };
    setVariantes(nuevas);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("productoId", selectedProductoId);
    formData.append("variantesCount", variantes.length.toString());

    variantes.forEach((variante, index) => {
      formData.append(`variante_${index}_talle`, variante.talle);
      formData.append(`variante_${index}_color`, variante.color);
      formData.append(`variante_${index}_material`, variante.material);
      formData.append(`variante_${index}_precio`, variante.precio.toString());
      
      variante.imagenFiles.forEach(file => {
        formData.append(`variante_${index}_imagen`, file);
      });
    });

    startTransition(async () => {
      try {
        await crearProductoAction(formData);
        alert("Variantes creadas y configuradas con éxito.");
        setVariantes([{ talle: "", color: "", material: "", precio: 0, imagenFiles: [], imagenPreviews: [] }]);
        setSelectedProductoId("");
      } catch (error) {
        alert("Ocurrió un error al configurar las variantes.");
        console.error(error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-5xl mx-auto" encType="multipart/form-data">

      {/* SECCIÓN 1: PRODUCTO BASE Y STOCK */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" /> 1. Configurar Producto Base
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Producto Base</label>
            <select 
              required defaultValue=""
              value={selectedProductoId} 
              onChange={e => setSelectedProductoId(e.target.value)} 
              className="border p-3 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="" disabled>Seleccione un producto base...</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 justify-center">
            <label className="text-sm font-bold text-gray-700">Stock Histórico (Todas las variantes)</label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
              {unallocatedStock !== null ? (
                <>
                  <span className="font-medium text-gray-600">Unidades Totales</span>
                  <span className="font-black text-xl text-indigo-600">{unallocatedStock} u.</span>
                </>
              ) : (
                <span className="text-gray-400 italic">Seleccione un producto para ver su stock</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: VARIANTES */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-indigo-600" /> 2. Variantes de Retail
          </h2>
          <button type="button" onClick={agregarVariante} className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
            <Plus className="w-4 h-4" /> Agregar Variante
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {variantes.map((variante, index) => (
            <div key={index} className="p-5 border border-gray-200 rounded-xl bg-gray-50 relative shadow-sm">
              {variantes.length > 1 && (
                <button type="button" onClick={() => eliminarVariante(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}

              <h3 className="font-bold text-gray-800 mb-4">Variante #{index + 1}</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Detalles de la Variante */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Talle</label>
                    <input required type="text" value={variante.talle} onChange={e => actualizarVariante(index, 'talle', e.target.value)} className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Ej: L" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Color</label>
                    <input required type="text" value={variante.color} onChange={e => actualizarVariante(index, 'color', e.target.value)} className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Ej: Azul" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Material</label>
                    <input required type="text" value={variante.material} onChange={e => actualizarVariante(index, 'material', e.target.value)} className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Ej: Algodón" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Precio Retail ($)</label>
                    <input required type="number" min="0" step="0.01" value={variante.precio} onChange={e => actualizarVariante(index, 'precio', parseFloat(e.target.value))} className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div>
                </div>

                {/* Multi-Imagen Upload */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Imágenes (Multi-Upload)</label>
                  
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-white cursor-pointer hover:border-indigo-500 transition-colors group h-full">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      required={variante.imagenFiles.length === 0}
                      onChange={(e) => handleMultipleImagesChange(index, e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                      <div className="p-3 bg-indigo-50 rounded-full group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Click o arrastrar imágenes</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Image Preview Grid */}
              {variante.imagenPreviews.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Previsualización</h4>
                  <div className="flex flex-wrap gap-3">
                    {variante.imagenPreviews.map((preview, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm w-20 h-20">
                        <img src={preview} alt={`preview ${i}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <button 
                            type="button" 
                            onClick={() => removeImage(index, i)}
                            className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>

      <button type="submit" disabled={isPending || !selectedProductoId} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 text-lg mb-10">
        {isPending ? (
          <><Loader2 className="w-6 h-6 animate-spin" /> Procesando Configuración...</>
        ) : (
          <><Save className="w-6 h-6" /> Configurar Variantes de Retail</>
        )}
      </button>

    </form>
  );
}