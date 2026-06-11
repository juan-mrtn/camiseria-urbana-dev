import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { DireccionRepository } from "@/repositories/direccion.repository";
import { CarritoRepository } from "@/repositories/carrito.repository";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";

export default async function CheckoutPage() {
  const session = await auth();

  // Si no está logueado, lo mandamos al login y luego lo devolvemos al checkout
  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const usuarioId = session.user.id;

  // Traemos las direcciones del usuario desde PostgreSQL
  const direcciones = await DireccionRepository.getByUsuarioId(usuarioId);

  // Traemos los items del carrito desde PostgreSQL
  const dbCartItems = await CarritoRepository.getCartWithItems(usuarioId);

  // Traemos el carritoId activo para procesar el pago
  const client = await db.getClient();
  let carritoId = null;
  try {
    const carritoResult = await client.query(
      `SELECT id FROM carrito WHERE usuario_id = $1 AND estado = 'abierto' LIMIT 1;`,
      [usuarioId]
    );
    if (carritoResult.rowCount && carritoResult.rowCount > 0) {
      carritoId = carritoResult.rows[0].id;
    }
  } finally {
    client.release();
  }

  // Si no hay carrito abierto, redirigir al catálogo
  if (!carritoId) {
    redirect("/catalogo");
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* HEADER SIMPLIFICADO PARA EL CHECKOUT */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900 tracking-tighter">
            La camisería Urbana
          </h1>
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm font-bold text-gray-700">
            <ShieldCheck className="w-4 h-4" />
            Pago seguro
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
          Detalles antes de finalizar la compra
        </h2>
        
        {/* Renderizamos el cliente interactivo pasándole los datos seguros */}
        <CheckoutClient 
          session={session} 
          direcciones={direcciones} 
          dbCartItems={dbCartItems} 
          carritoId={carritoId}
        />
      </main>
    </div>
  );
}