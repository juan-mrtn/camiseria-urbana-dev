"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const safePathname = pathname ?? "/";
  
  const currentSort = searchParams?.get("sort") || "relevance";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    
    if (value && value !== "relevance") {
      params.set("sort", value);
    } else {
      params.delete("sort"); // default is relevance, no need to clutter URL
    }
    
    params.set("page", "1"); // Always reset to page 1 on new sort
    
    router.push(`${safePathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <select 
      className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-700 outline-none cursor-pointer"
      value={currentSort}
      onChange={handleSortChange}
    >
      <option value="relevance">Ordenar: Relevancia</option>
      <option value="price_asc">Precio: Menor a Mayor</option>
      <option value="price_desc">Precio: Mayor a Menor</option>
    </select>
  );
}
