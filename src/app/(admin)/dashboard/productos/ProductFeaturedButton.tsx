"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";
import { toggleProductFeaturedAction } from "@/actions/admin.actions";

interface Props {
  productoId: string;
  esDestacado: boolean;
}

export default function ProductFeaturedButton({ productoId, esDestacado }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleProductFeaturedAction(productoId, esDestacado);
      if (!res.success) {
        alert(res.error || "Error al actualizar estado destacado.");
      }
    });
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`p-2 rounded-lg transition-colors ${
        isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-50'
      }`}
      title={esDestacado ? "Quitar de destacados" : "Destacar producto"}
    >
      <Star className={`w-4 h-4 transition-all ${
        esDestacado 
          ? "text-amber-500 fill-amber-500" 
          : "text-gray-400 hover:text-amber-500"
      }`} />
    </button>
  );
}
