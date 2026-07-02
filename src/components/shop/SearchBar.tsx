"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

export default function SearchBar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Set initial value from URL on the client-side to bypass Next.js SSR constraints
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && inputRef.current) {
      inputRef.current.value = q;
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q")?.toString().trim();

    if (query) {
      router.push(`/catalogo?q=${encodeURIComponent(query)}`);
    } else {
      router.push(`/catalogo`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg">
      <input
        ref={inputRef}
        type="text"
        name="q"
        placeholder="Buscar productos por nombre o material..."
        className="w-full h-10 pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F772D] bg-white text-base text-gray-800"
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center">
        <Search className="h-4 w-4" />
      </div>
      <button type="submit" className="hidden">Buscar</button>
    </form>
  );
}
