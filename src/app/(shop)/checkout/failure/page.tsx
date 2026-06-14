import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { XCircle, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function CheckoutFailurePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
        </div>
        
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Pago rechazado
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Tu pago ha sido rechazado por Mercado Pago o fue cancelado. 
            No te preocupes, **tu carrito sigue intacto** y no se ha cobrado nada de tu tarjeta.
          </p>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">¿Qué puedes hacer?</h3>
          <ul className="text-sm text-gray-600 text-left space-y-3">
            <li className="flex gap-2">
              <span className="font-bold text-red-600">•</span>
              Verifica los datos ingresados en la tarjeta o intenta con otro medio de pago.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-red-600">•</span>
              Asegúrate de contar con los fondos suficientes.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-red-600">•</span>
              Vuelve a tu carrito e intenta pagar nuevamente.
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/checkout" 
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            <ShoppingCart className="w-5 h-5" /> Ir a pagar
          </Link>
          <Link 
            href="/" 
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Volver al inicio <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
