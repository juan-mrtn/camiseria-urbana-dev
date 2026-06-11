"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteBannerAction } from "@/actions/banner.actions";

export default function DeleteBannerButton({ id, totalCount }: { id: string, totalCount: number }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (totalCount <= 1) {
      alert("No puedes eliminar este banner. El sistema requiere al menos 1 banner para funcionar.");
      return;
    }

    if (!confirm("¿Estás seguro de que deseas eliminar este banner? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteBannerAction(id);
    
    if (!result.success) {
      alert(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting || totalCount <= 1}
      title={totalCount <= 1 ? "Debe haber al menos 1 banner" : "Eliminar banner"}
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
}
