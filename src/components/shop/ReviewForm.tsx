"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { crearOpinionAction } from "@/actions/opinion.actions";

interface Props {
  productoVarianteId: string;
}

export default function ReviewForm({ productoVarianteId }: Props) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comentario, setComentario] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Por favor selecciona una calificación en estrellas.");
      return;
    }
    if (!comentario.trim()) {
      alert("Por favor escribe tu comentario.");
      return;
    }

    startTransition(async () => {
      try {
        await crearOpinionAction(productoVarianteId, rating, comentario);
        setRating(0);
        setComentario("");
      } catch (error) {
        console.error("Error publicando opinión:", error);
        alert("Ocurrió un error al enviar tu opinión. Intenta nuevamente.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4">
      <p className="text-sm font-medium text-gray-800 mb-2">¿Qué te pareció este producto?</p>
      
      {/* Selector interactivo de estrellas */}
      <div className="flex gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 rounded-full hover:bg-gray-50 focus:outline-none transition-colors border border-gray-200 bg-white shadow-sm"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                star <= (hoverRating || rating)
                  ? "fill-gray-800 text-gray-800"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Escribe tu comentario..."
        className="w-full text-sm border border-gray-200 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] resize-none"
        rows={3}
      />

      <button
        type="submit"
        disabled={isPending || rating === 0 || !comentario.trim()}
        className={`bg-[#6D28D9] text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center transition w-max
          ${(isPending || rating === 0 || !comentario.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-violet-800'}`}
      >
        {isPending ? 'Publicando...' : 'Publicar opinión'}
      </button>
    </form>
  );
}
