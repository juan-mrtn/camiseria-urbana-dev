import { auth } from "@/server/auth";
import { CarritoRepository } from "@/repositories/carrito.repository";
import CartBadgeClient from "./CartBadgeClient";

export default async function CartBadgeIcon() {
    const session = await auth();
    let count = 0;

    if (session?.user?.id) {
        count = await CarritoRepository.getCartItemCount(session.user.id);
    }

    return <CartBadgeClient initialCount={count} />;
}
