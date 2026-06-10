"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

interface Props {
  talles: string[];
  materiales: string[];
}

export default function FilterSidebar({ talles, materiales }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const safePathname = pathname ?? "/";
  const router = useRouter();

  const currentTalle = searchParams?.get("talle") || "";
  const currentColor = searchParams?.get("color") || "";
  const currentMaterial = searchParams?.get("material") || "";
  
  const [minPrice, setMinPrice] = useState(searchParams?.get("precio_min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams?.get("precio_max") || "");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.set("page", "1"); // Volvemos a pagina 1
      return params.toString();
    },
    [searchParams]
  );

  const updateFilter = (key: string, value: string) => {
    router.push(`${safePathname}?${createQueryString(key, value)}`, { scroll: false });
  };

  // Debounce para los precios
  useEffect(() => {
    const handler = setTimeout(() => {
      // 1. Usamos window.location para obtener el estado real sin depender de React y evitar el loop
      const params = new URLSearchParams(window.location.search);
      const currentPath = window.location.pathname;
      
      let hasChanges = false;

      // 2. Evaluamos si minPrice cambió respecto a la URL
      if (minPrice && params.get("precio_min") !== minPrice) {
        params.set("precio_min", minPrice);
        hasChanges = true;
      } else if (!minPrice && params.has("precio_min")) {
        params.delete("precio_min");
        hasChanges = true;
      }
      
      // 3. Evaluamos si maxPrice cambió respecto a la URL
      if (maxPrice && params.get("precio_max") !== maxPrice) {
        params.set("precio_max", maxPrice);
        hasChanges = true;
      } else if (!maxPrice && params.has("precio_max")) {
        params.delete("precio_max");
        hasChanges = true;
      }

      // 4. Si hay cambios, empujamos la nueva URL de manera segura
      if (hasChanges) {
        params.set("page", "1");
        router.push(`${currentPath}?${params.toString()}`, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice]); // Solo dependemos del estado local para romper el loop



  return (
    <aside className="w-full md:w-64 shrink-0 space-y-8">
      {/* Filtro Material */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest mb-4 border-l-4 border-indigo-600 pl-2">
          Material
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          {materiales.map((mat) => (
            <li key={mat} className="flex items-center gap-2 cursor-pointer hover:text-indigo-600">
              <input 
                type="checkbox" 
                className="rounded border-gray-300" 
                id={mat} 
                checked={currentMaterial === mat}
                onChange={() => updateFilter("material", currentMaterial === mat ? "" : mat)}
              />
              <label htmlFor={mat} className="cursor-pointer flex-1">{mat}</label>
            </li>
          ))}
        </ul>
      </div>

      {/* Filtro Talle */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest mb-4 border-l-4 border-indigo-600 pl-2">
          Talle
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {talles.map((talle) => {
            const isSelected = currentTalle === talle;
            return (
              <button 
                key={talle} 
                onClick={() => updateFilter("talle", isSelected ? "" : talle)}
                className={`border py-2 text-xs font-bold transition rounded ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-black hover:text-white hover:border-black'}`}
              >
                {talle}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Filtro Color */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest mb-4 border-l-4 border-indigo-600 pl-2">
          Color
        </h3>
        <input 
          type="text" 
          placeholder="Ej: Azul, Blanco, Negro" 
          className="w-full border p-2 text-sm rounded focus:ring-2 focus:ring-indigo-500 outline-none"
          value={currentColor}
          onChange={(e) => updateFilter("color", e.target.value)}
        />
      </div>

      {/* Filtro Precio */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest mb-4 border-l-4 border-indigo-600 pl-2">
          Rango de Precio
        </h3>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Mín" 
            className="w-full border p-2 text-sm rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className="text-gray-400">-</span>
          <input 
            type="number" 
            placeholder="Máx" 
            className="w-full border p-2 text-sm rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>
      
      {/* Botón Limpiar */}
      <button 
        onClick={() => router.push(safePathname)}
        className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold uppercase rounded transition"
      >
        Limpiar Filtros
      </button>
    </aside>
  );
}
