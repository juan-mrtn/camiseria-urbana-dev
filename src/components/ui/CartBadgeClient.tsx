"use client";

import { useCart } from "@/providers/CartProvider";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface CartBadgeClientProps {
  initialCount: number;
}

export default function CartBadgeClient({ initialCount }: CartBadgeClientProps) {
  const { cartCount: localCount } = useCart();
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Si no está montado, mostramos el initialCount del servidor para evitar flashes si es posible
  let count = initialCount;
  
  if (mounted) {
    // Si está logueado, manda el server. Si es invitado, manda el carrito local.
    count = status === "authenticated" ? initialCount : localCount;
  }

  return (
    <Link href="/carrito" className="relative p-2 text-gray-600 hover:text-black transition-colors focus:outline-none flex items-center justify-center">
      <ShoppingCart className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 min-w-[20px] h-[20px] text-[10px] font-bold text-white bg-orange-500 rounded-full translate-x-1 -translate-y-1 border-2 border-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
