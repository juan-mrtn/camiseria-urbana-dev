"use client";

import { useTransition } from "react";
import { toggleProductoDestacadoAction } from "@/actions/admin.actions";

interface ProductDestacadoToggleProps {
  productoId: string;
  esDestacado: boolean;
}

export default function ProductDestacadoToggle({ productoId, esDestacado }: ProductDestacadoToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleProductoDestacadoAction(productoId, !esDestacado);
      if (!res.success) {
        alert(res.error || "Error al destacar el producto");
      }
    });
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer ml-4" title="Destacar en Inicio">
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={esDestacado} 
        onChange={handleToggle}
        disabled={isPending}
      />
      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-50"></div>
    </label>
  );
}
