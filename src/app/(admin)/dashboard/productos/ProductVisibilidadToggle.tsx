"use client";

import { useTransition } from "react";
import { toggleProductoVisibilidadAction } from "@/actions/admin.actions";
import { Eye, EyeOff } from "lucide-react";

interface ProductVisibilidadToggleProps {
  productoId: string;
  activo: boolean;
}

export default function ProductVisibilidadToggle({ productoId, activo }: ProductVisibilidadToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleProductoVisibilidadAction(productoId, !activo);
      if (!res.success) {
        alert(res.error || "Error al cambiar la visibilidad");
      }
    });
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`p-2 rounded-lg transition-colors ${
        activo ? "text-indigo-600 hover:bg-indigo-50" : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
      } disabled:opacity-50`}
      title={activo ? "Ocultar producto (Baja lógica)" : "Mostrar producto en catálogo"}
    >
      {activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    </button>
  );
}
