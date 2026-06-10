import { ShoppingCart } from "lucide-react";
import { auth } from "@/server/auth";
import { CarritoRepository } from "@/repositories/carrito.repository";
import Link from "next/link";

export default async function CartBadgeIcon() {
    const session = await auth();
    let count = 0;

    if (session?.user?.id) {
        count = await CarritoRepository.getCartItemCount(session.user.id);
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
