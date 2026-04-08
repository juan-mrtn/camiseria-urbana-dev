// src/app/(shop)/checkout/page.tsx
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { DireccionRepository } from "@/repositories/direccion.repository";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { ShieldCheck } from "lucide-react";

export default async function CheckoutPage() {
  const session = await auth();

  // Si no está logueado, lo mandamos al login y luego lo devolvemos al checkout
  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  // Traemos las direcciones del usuario desde PostgreSQL
  const direcciones = await DireccionRepository.getByUsuarioId(session.user.id);

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
        <CheckoutClient session={session} direcciones={direcciones} />
      </main>
    </div>
  );
}