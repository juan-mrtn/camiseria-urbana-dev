"use client";

import { useCart } from "@/providers/CartProvider";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CartBadgeClientProps {
  initialCount: number;
}

export default function CartBadgeClient({ initialCount }: CartBadgeClientProps) {
  const { cartCount: localCount } = useCart();
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Si no está montado, mostramos el initialCount del servidor para evitar flashes si es posible
  let count = initialCount;
  
  if (mounted) {
    // Si está logueado, manda el server. Si es invitado, manda el carrito local.
    count = status === "authenticated" ? initialCount : localCount;
  }

  useEffect(() => {
    if (count > 0 && mounted) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [count, mounted]);

  return (
    <Link id="cart-icon" href="/carrito" className="relative p-2 text-gray-600 hover:text-black transition-colors focus:outline-none flex items-center justify-center">
      <motion.div
        animate={isBouncing ? { scale: [1, 1.3, 0.9, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ShoppingCart className="w-6 h-6" />
      </motion.div>
      {count > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 min-w-[20px] h-[20px] text-[10px] font-bold text-white bg-orange-500 rounded-full translate-x-1 -translate-y-1 border-2 border-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
