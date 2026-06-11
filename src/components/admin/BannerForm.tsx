"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import { createBannerAction } from "@/actions/banner.actions";

interface ProductoBase {
  id: string;
  nombre: string;
  codigo: string;
  imagen_url: string | null;
}

interface BannerFormProps {
  productosDisponibles: ProductoBase[];
}

export default function BannerForm({ productosDisponibles }: BannerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for link destination
  const [destino, setDestino] = useState<string>('coleccion');
  
  // State for image preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // State for selected products
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Append the selected products as a JSON string
      formData.append("productos", JSON.stringify(selectedProducts));

      const result = await createBannerAction(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      router.push("/dashboard/banners");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 md:p-8 space-y-8">
        
        {/* Basic Info Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Información Principal</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="titulo" className="block text-sm font-semibold text-gray-700 mb-1">Título del Banner</label>
              <input 
                type="text" 
                id="titulo" 
                name="titulo" 
                required 
                placeholder="Ej: Promo 2x1 en Nueva Colección"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
              />
            </div>
            
            <div>
              <label htmlFor="subtitulo" className="block text-sm font-semibold text-gray-700 mb-1">Subtítulo / Descripción corta</label>
              <textarea 
                id="subtitulo" 
                name="subtitulo" 
                required 
                rows={2}
                placeholder="Ej: Aprovechá por tiempo limitado nuestras prendas exclusivas."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Destino al hacer clic en el Banner</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${destino === '/catalogo' ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="destino" value="/catalogo" checked={destino === '/catalogo'} onChange={() => setDestino('/catalogo')} className="text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm font-medium">Catálogo General</span>
                </label>
                <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${destino === '/ofertas' ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="destino" value="/ofertas" checked={destino === '/ofertas'} onChange={() => setDestino('/ofertas')} className="text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm font-medium">Ofertas Especiales</span>
                </label>
                <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${destino === 'coleccion' ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="destino" value="coleccion" checked={destino === 'coleccion'} onChange={() => setDestino('coleccion')} className="text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm font-medium">Colección Específica</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Imagen del Banner</h3>
          <div className="relative">
            <input 
              type="file" 
              id="imagen" 
              name="imagen" 
              accept="image/*" 
              required
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`w-full aspect-[21/9] md:aspect-[3/1] border-2 border-dashed rounded-xl overflow-hidden flex flex-col items-center justify-center transition-colors ${imagePreview ? 'border-indigo-500' : 'border-gray-300 hover:border-indigo-400 bg-gray-50'}`}>
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <UploadCloud className="w-10 h-10 text-white mb-2" />
                    <p className="text-white font-medium">Clic para cambiar imagen</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                    <UploadCloud className="w-8 h-8 text-indigo-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Arrastra una imagen o haz clic</p>
                  <p className="text-xs text-gray-500 mt-1">Recomendado: 1920x720px (JPG, PNG, WebP)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Selection Section (Only if Coleccion is selected) */}
        {destino === 'coleccion' && (
          <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center justify-between">
            <span>Asignar Productos (La "Colección")</span>
            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {selectedProducts.length} seleccionados
            </span>
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Selecciona los productos que se mostrarán cuando el cliente haga clic en el banner.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1 pr-3">
            {productosDisponibles.length === 0 ? (
              <p className="text-sm text-gray-500 col-span-full">No hay productos base disponibles en el sistema.</p>
            ) : (
              productosDisponibles.map(producto => (
                <div 
                  key={producto.id}
                  onClick={() => toggleProduct(producto.id)}
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${selectedProducts.includes(producto.id) ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="relative w-12 h-16 bg-white rounded overflow-hidden shrink-0 border border-gray-100">
                    {producto.imagen_url ? (
                      <Image src={producto.imagen_url} alt={producto.nombre} fill sizes="48px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">Sin img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-400 truncate">{producto.codigo}</p>
                    <p className={`text-sm font-semibold truncate ${selectedProducts.includes(producto.id) ? 'text-indigo-900' : 'text-gray-900'}`}>
                      {producto.nombre}
                    </p>
                  </div>
                  <div>
                    {selectedProducts.includes(producto.id) && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

      </div>
      
      <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !imagePreview || (destino === 'coleccion' && selectedProducts.length === 0)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? "Creando banner..." : "Crear Banner y Colección"}
        </button>
      </div>
    </form>
  );
}
