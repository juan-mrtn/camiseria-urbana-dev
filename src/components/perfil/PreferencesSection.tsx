// src/components/perfil/PreferencesSection.tsx
"use client";

import { Mail, Check, Plus } from "lucide-react";
import { useTransition } from "react";
import { toggleNewsletterAction } from "@/actions/usuario.actions";

interface Props {
  suscrito: boolean;
}

export default function PreferencesSection({ suscrito }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // Si el usuario ya está suscrito y quiere cancelar, le pedimos confirmación
    if (suscrito) {
      const confirmar = window.confirm("¿Estás seguro de que quieres cancelar tu suscripción al newsletter? Dejarás de recibir nuestras promociones exclusivas.");
      
      // Si el usuario hace clic en "Cancelar" en el cuadro de diálogo, detenemos la función
      if (!confirmar) return; 
    }

    // Si no estaba suscrito, o si confirmó la desuscripción, ejecutamos la acción
    startTransition(async () => {
      await toggleNewsletterAction(suscrito);
    });
  };

  return (
    <section className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm mt-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Preferencias</h2>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-700" />
            <span className="font-bold text-gray-900">Suscripción a newsletter</span>
          </div>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            Recibe novedades, promociones y descuentos exclusivos en tu correo.
          </p>
        </div>
        
        <button 
          onClick={handleToggle}
          disabled={isPending}
          className={`flex items-center gap-2 font-bold py-2 px-4 rounded-lg transition-colors text-sm shadow-sm whitespace-nowrap border disabled:opacity-50 disabled:cursor-not-allowed
            ${suscrito 
              ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100' 
              : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-900'
            }
          `}
        >
          {suscrito ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              {isPending ? 'Actualizando...' : 'Suscrito'}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {isPending ? 'Actualizando...' : 'Suscribirme'}
            </>
          )}
        </button>
      </div>
    </section>
  );
}