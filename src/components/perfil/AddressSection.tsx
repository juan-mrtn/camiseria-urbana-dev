// src/components/perfil/AddressSection.tsx
'use client';

import { useState } from "react";
import { Home, Building2, Edit2, Trash2, Star, Plus, X, MapPin } from "lucide-react";
import { saveDireccionAction, deleteDireccionAction, setPrincipalAction } from "@/actions/direccion.actions";

interface Direccion {
  id: string;
  titulo: string;
  calle: string;
  numero: string;
  departamento: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  principal: boolean;
}

export default function AddressSection({ direcciones }: { direcciones: Direccion[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [direccionEditando, setDireccionEditando] = useState<Direccion | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Llamamos a la Server Action pasando los datos
    await saveDireccionAction(formData, direccionEditando?.id);
    setIsModalOpen(false); // Cerramos el modal cuando termine
  };

  const getIcon = (titulo: string) => {
    const t = titulo.toLowerCase();
    if (t.includes('casa')) return <Home className="w-5 h-5 text-gray-700" />;
    if (t.includes('trabajo') || t.includes('oficina')) return <Building2 className="w-5 h-5 text-gray-700" />;
    return <MapPin className="w-5 h-5 text-gray-700" />;
  };

  return (
    <section className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm mt-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold text-gray-900">Direcciones de envío</h2>
        <button onClick={() => { setDireccionEditando(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-lg transition-colors text-sm">
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>
      
      {/* LISTA DE DIRECCIONES */}
      <div className="flex flex-col gap-4 mb-5">
        {direcciones.length === 0 ? (
          <p className="text-gray-500 text-sm italic py-4 text-center border-2 border-dashed rounded-lg">No tenés direcciones guardadas.</p>
        ) : (
          direcciones.map((dir) => (
            <div key={dir.id} className={`border rounded-xl p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 ${dir.principal ? 'bg-indigo-50/30 border-indigo-200' : 'bg-gray-50 border-gray-200'}`}>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getIcon(dir.titulo)}
                  <span className="font-bold text-gray-900">{dir.titulo}</span>
                  {dir.principal && (
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full ml-2">Principal</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-3 font-medium">
                  {dir.calle} {dir.numero}{dir.departamento ? `, ${dir.departamento}` : ''}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {dir.ciudad}, {dir.provincia}, CP {dir.codigoPostal}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setDireccionEditando(dir); setIsModalOpen(true); }} className="flex items-center gap-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-1.5 px-3 rounded-lg text-xs">
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
                <button onClick={() => deleteDireccionAction(dir.id)} className="flex items-center gap-1.5 border border-gray-200 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 font-semibold py-1.5 px-3 rounded-lg text-xs">
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
                {!dir.principal && (
                  <button onClick={() => setPrincipalAction(dir.id)} className="flex items-center gap-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-1.5 px-3 rounded-lg text-xs">
                    <Star className="w-3.5 h-3.5" /> Hacer principal
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DETALLADO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {direccionEditando ? 'Editar dirección' : 'Agregar nueva dirección'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Título (Ej: Casa, Trabajo)</label>
                  <input type="text" name="titulo" defaultValue={direccionEditando?.titulo} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Calle</label>
                    <input type="text" name="calle" defaultValue={direccionEditando?.calle} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Número</label>
                    <input type="text" name="numero" defaultValue={direccionEditando?.numero} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Departamento / Piso (Opcional)</label>
                  <input type="text" name="departamento" defaultValue={direccionEditando?.departamento} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Ciudad</label>
                    <input type="text" name="ciudad" defaultValue={direccionEditando?.ciudad} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Provincia</label>
                    <input type="text" name="provincia" defaultValue={direccionEditando?.provincia} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 w-1/2 pr-2">
                  <label className="text-sm font-medium text-gray-700">Código postal</label>
                  <input type="text" name="codigoPostal" defaultValue={direccionEditando?.codigoPostal} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <input type="checkbox" name="principal" id="principal" defaultChecked={direccionEditando?.principal} className="w-4 h-4 text-indigo-600" />
                  <label htmlFor="principal" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Establecer como principal
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg">
                    Cancelar
                  </button>
                  <button type="submit" className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    {direccionEditando ? 'Guardar cambios' : 'Guardar dirección'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}