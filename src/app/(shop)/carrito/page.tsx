// src/app/(shop)/carrito/page.tsx
import { auth } from "@/server/auth";
import { CarritoRepository } from "@/repositories/carrito.repository";
import CartClient from "@/components/carrito/CartClient";

export default async function CartPage() {
  const session = await auth();
  
  let dbItems = null;

  if (session?.user?.id) {
    dbItems = await CarritoRepository.getCartWithItems(session.user.id);
  }

  return <CartClient dbItems={dbItems} />;
}