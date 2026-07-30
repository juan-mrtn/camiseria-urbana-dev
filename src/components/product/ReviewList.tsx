"use client";

import { Star } from "lucide-react";

export interface ReviewItem {
  id: string;
  estrellas: number;
  comentario: string;
  fecha: Date | string;
  usuario_nombre?: string | null;
}

interface ReviewListProps {
  opiniones?: ReviewItem[];
  userRole?: string;
}

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "A";
  const cleanName = name.trim();
  const parts = cleanName.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ReviewList({ opiniones = [], userRole = "client" }: ReviewListProps) {
  if (!opiniones || opiniones.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
        <p className="text-sm text-gray-500 font-medium">Aún no hay opiniones para este producto.</p>
        <p className="text-xs text-gray-400 mt-1">¡Sé el primero en comprar y compartir tu experiencia!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
      {opiniones.map((opinion) => {
        // Para los clientes las opiniones siempre aparecen como anónimas ("Usuario Anónimo")
        const isAdmin = userRole === "admin";
        const displayName = isAdmin && opinion.usuario_nombre ? opinion.usuario_nombre : "Usuario Anónimo";
        const initials = isAdmin && opinion.usuario_nombre ? getInitials(opinion.usuario_nombre) : "A";

        const fechaFormateada = new Date(opinion.fecha).toLocaleDateString("es-AR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return (
          <div
            key={opinion.id}
            className="bg-gray-50/80 hover:bg-gray-50 p-4 rounded-xl border border-gray-100 transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Avatar circular con inicial */}
                <div className="w-10 h-10 rounded-full bg-[#31572C] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                  {initials}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{displayName}</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Number(opinion.estrellas)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400 font-medium">{fechaFormateada}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed italic pl-1">
              "{opinion.comentario}"
            </p>
          </div>
        );
      })}
    </div>
  );
}
