"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleFavoritoAction } from "@/actions/favorito.actions";

interface Props {
  productoVarianteId: string;
  isFavoritoInicial: boolean;
}

export default function BotonFavorito({ productoVarianteId, isFavoritoInicial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isFavorito, setIsFavorito] = useState(isFavoritoInicial);

  const handleToggle = () => {
    // 1. Optimistic Update: Cambiamos la UI inmediatamente sin esperar a la BD
    const nuevoEstado = !isFavorito;
    setIsFavorito(nuevoEstado);

    // 2. Ejecutar la acción asíncrona en el servidor
    startTransition(async () => {
      try {
        const estadoReal = await toggleFavoritoAction(productoVarianteId);
        setIsFavorito(estadoReal); // Sincronizamos con la verdad del servidor
      } catch (error) {
        // 3. Rollback: Si hay error (ej: usuario no logueado), revertimos el estado
        console.error("Error al actualizar favoritos:", error);
        setIsFavorito(!nuevoEstado); 
        alert("No se pudo actualizar favoritos. Inicia sesión para guardar.");
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={isFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`p-4 border rounded-lg transition-all duration-300 flex items-center justify-center focus:outline-none 
        ${isFavorito 
          ? 'bg-red-50 border-red-200 hover:bg-red-100' 
          : 'bg-white border-gray-200 hover:bg-gray-50'
        } ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <Heart
        className={`w-6 h-6 transition-transform duration-300 ${
          isFavorito ? "fill-red-500 text-red-500 scale-110" : "text-gray-400 scale-100"
        }`}
      />
    </button>
  );
}
