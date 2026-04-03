'use client';

import { useState } from "react";
import { Plus, X } from "lucide-react";


export default function AddAddressModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Función para cerrar el modal de forma limpia
  const closeModal = () => setIsOpen(false);

  return (
    <>
      {/* BOTÓN QUE ABRE EL MODAL */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors text-sm w-max"
      >
        <Plus className="w-4 h-4" />
        Agregar nueva dirección
      </button>

      {/* VENTANA EMERGENTE (MODAL) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* Contenedor del Modal */}
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Agregar nueva dirección</h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo del Formulario con Scroll si es necesario */}
            <div className="p-6 overflow-y-auto">
              <form className="flex flex-col gap-4">
                
                {/* Fila 1 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Título de la dirección (Ej: Casa, Trabajo)</label>
                  <input type="text" placeholder="Ej: Casa" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
                </div>

                {/* Fila 2 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Calle y número</label>
                  <input type="text" placeholder="Ej: Av. San Martín 1234" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
                </div>

                {/* Fila 3 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Departamento / Piso (Opcional)</label>
                  <input type="text" placeholder="Ej: Piso 3, Depto A" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
                </div>

                {/* Fila 4: Ciudad y Provincia en columnas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Ciudad</label>
                    <input type="text" placeholder="Ej: Concordia" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Provincia</label>
                    <input type="text" placeholder="Ej: Entre Ríos" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
                  </div>
                </div>

                {/* Fila 5 */}
                <div className="flex flex-col gap-1.5 w-1/2 pr-2">
                  <label className="text-sm font-medium text-gray-700">Código postal</label>
                  <input type="text" placeholder="Ej: 3200" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-3 mt-2">
                  <input type="checkbox" id="principal" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                  <label htmlFor="principal" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                    Establecer como dirección principal
                  </label>
                </div>
              </form>
            </div>

            {/* Pie del Modal (Botones) */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={closeModal}
                className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancelar
              </button>
              <button 
                className="px-5 py-2.5 text-sm font-bold text-white bg-[#7C3AED] rounded-lg hover:bg-[#6D28D9] transition-colors shadow-md"
              >
                Guardar dirección
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}