'use client';

import { useState } from "react";
import { Home, Building2, Edit2, Trash2, Star, Plus, X, MapPin } from "lucide-react";

interface Direccion {
  id: string;
  titulo: string;
  calle: string;
  departamento?: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  principal: boolean;
  icono: 'home' | 'building' | 'other';
}

export default function AddressSection() {
  const [direcciones, setDirecciones] = useState<Direccion[]>([
    { 
      id: '1', titulo: 'Casa', calle: 'Calle Principal 123', departamento: 'Piso 1', 
      ciudad: 'Concordia', provincia: 'Entre Ríos', codigoPostal: '3200', 
      principal: true, icono: 'home' 
    },
    { 
      id: '2', titulo: 'Trabajo', calle: 'Av. San Lorenzo Este 456', departamento: 'Oficina 2', 
      ciudad: 'Concordia', provincia: 'Entre Ríos', codigoPostal: '3200', 
      principal: false, icono: 'building' 
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [direccionEditando, setDireccionEditando] = useState<Direccion | null>(null);

  const eliminarDireccion = (id: string) => {
    setDirecciones(direcciones.filter(d => d.id !== id));
  };

  const establecerPrincipal = (id: string) => {
    setDirecciones(direcciones.map(d => ({
      ...d,
      principal: d.id === id
    })));
  };

  const abrirModalNuevo = () => {
    setDireccionEditando(null);
    setIsModalOpen(true);
  };

  const abrirModalEditar = (direccion: Direccion) => {
    setDireccionEditando(direccion);
    setIsModalOpen(true);
  };

  const guardarDireccion = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
  };

  const getIcon = (tipo: string) => {
    if (tipo === 'home') return <Home className="w-5 h-5 text-gray-700" />;
    if (tipo === 'building') return <Building2 className="w-5 h-5 text-gray-700" />;
    return <MapPin className="w-5 h-5 text-gray-700" />;
  };

  return (
    <section className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-5">Direcciones de envío</h2>
      
      {/* LISTA DE DIRECCIONES */}
      <div className="flex flex-col gap-4 mb-5">
        {direcciones.length === 0 ? (
          <p className="text-gray-500 text-sm italic py-4">No tenés direcciones guardadas.</p>
        ) : (
          direcciones.map((dir) => (
            <div key={dir.id} className={`border rounded-xl p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 ${dir.principal ? 'bg-purple-50/30 border-purple-100' : 'bg-gray-50 border-gray-200'}`}>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getIcon(dir.icono)}
                  <span className="font-bold text-gray-900">{dir.titulo}</span>
                  {dir.principal && (
                    <span className="bg-purple-100 text-[#6A0DAD] text-xs font-bold px-2.5 py-0.5 rounded-full ml-2">Principal</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-3 font-medium">
                  {dir.calle}{dir.departamento ? `, ${dir.departamento}` : ''}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {dir.ciudad}, {dir.provincia}, CP {dir.codigoPostal}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => abrirModalEditar(dir)} className="flex items-center gap-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-1.5 px-3 rounded-lg transition-colors text-sm shadow-sm">
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
                <button onClick={() => eliminarDireccion(dir.id)} className="flex items-center gap-1.5 border border-gray-200 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 font-semibold py-1.5 px-3 rounded-lg transition-colors text-sm shadow-sm">
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
                {!dir.principal && (
                  <button onClick={() => establecerPrincipal(dir.id)} className="flex items-center gap-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-1.5 px-3 rounded-lg transition-colors text-sm shadow-sm">
                    <Star className="w-3.5 h-3.5" /> Establecer principal
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* BOTÓN AGREGAR */}
      <button onClick={abrirModalNuevo} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
        <Plus className="w-4 h-4" />
        Agregar nueva dirección
      </button>

      {/* MODAL DETALLADO CON TAILWINDCSS-ANIMATE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Fondo oscuro: animamos la opacidad al entrar */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Contenedor del Modal: animamos entrada con fade y zoom desde el 95% */}
          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 ease-out">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {direccionEditando ? 'Editar dirección' : 'Agregar nueva dirección'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form onSubmit={guardarDireccion} className="flex flex-col gap-4">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Título de la dirección (Ej: Casa, Trabajo)</label>
                  <input type="text" defaultValue={direccionEditando?.titulo} placeholder="Ej: Casa" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow font-medium" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Calle y número</label>
                  <input type="text" defaultValue={direccionEditando?.calle} placeholder="Ej: Av. San Martín 1234" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow font-medium" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Departamento / Piso (Opcional)</label>
                  <input type="text" defaultValue={direccionEditando?.departamento} placeholder="Ej: Piso 3, Depto A" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow font-medium" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Ciudad</label>
                    <input type="text" defaultValue={direccionEditando?.ciudad} placeholder="Ej: Concordia" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow font-medium" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Provincia</label>
                    <input type="text" defaultValue={direccionEditando?.provincia} placeholder="Ej: Entre Ríos" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow font-medium" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 w-1/2 pr-2">
                  <label className="text-sm font-medium text-gray-700">Código postal</label>
                  <input type="text" defaultValue={direccionEditando?.codigoPostal} placeholder="Ej: 3200" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow font-medium" />
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <input type="checkbox" id="principal" defaultChecked={direccionEditando?.principal} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-shadow" />
                  <label htmlFor="principal" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                    Establecer como dirección principal
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm active:scale-95">
                    Cancelar
                  </button>
                  <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#7C3AED] rounded-lg hover:bg-[#6D28D9] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95 active:translate-y-0">
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