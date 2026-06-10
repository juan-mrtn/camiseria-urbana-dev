"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const safePathname = pathname ?? "/";
  const router = useRouter();

  const [query, setQuery] = useState(searchParams?.get("q") || "");

  // Sincronizar el input si cambia la URL por fuera (ej: al limpiar filtros)
  useEffect(() => {
    const q = searchParams?.get("q") || "";
    setQuery(q);
  }, [searchParams]);

  // Debounce para actualizar la URL
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams ? searchParams.toString() : "");

      const trimmedQuery = query.trim();
      if (trimmedQuery) {
        params.set("q", trimmedQuery);
      } else {
        params.delete("q");
      }
      params.set("page", "1"); // Volver a pág 1 en búsqueda

      if (params.get("q") !== (searchParams?.get("q") || "")) {
        router.push(`/catalogo?${params.toString()}`, { scroll: false });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [query, router, searchParams]);

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Buscar productos por nombre o material..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm text-gray-800"
      />
      <div className="absolute left-3 top-2.5 text-gray-400">
        <Search className="h-4.5 w-4.5" />
      </div>
    </div>
  );
}
