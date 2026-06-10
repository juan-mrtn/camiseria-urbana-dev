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
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <input
        ref={inputRef}
        type="text"
        name="q"
        placeholder="Buscar productos por nombre o material..."
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm text-gray-800"
      />
      <div className="absolute left-3 top-2.5 text-gray-400">
        <Search className="h-4.5 w-4.5" />
      </div>
      <button type="submit" className="hidden">Buscar</button>
    </form>
  );
}
