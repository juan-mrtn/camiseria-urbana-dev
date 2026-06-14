import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { Clock, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function CheckoutPendingPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        
        <div className="flex justify-center">
          <div className="rounded-full bg-amber-100 p-4">
            <Clock className="h-16 w-16 text-amber-600" />
          </div>
        </div>
        
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Pago pendiente
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Tu pago está siendo procesado o requiere acreditación (ejemplo: Rapipago o Pago Fácil). 
            Te notificaremos por correo electrónico cuando se confirme el ingreso.
          </p>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Próximos pasos</h3>
          <ul className="text-sm text-gray-600 text-left space-y-3">
            <li className="flex gap-2">
              <span className="font-bold text-amber-600">•</span>
              Si elegiste efectivo, dirígete a la sucursal para realizar el pago.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-amber-600">•</span>
              El stock se reservará una vez que el pago se acredite.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-amber-600">•</span>
              Puedes revisar el estado desde la sección "Mis pedidos".
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/mi-cuenta/opiniones" 
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors"
          >
            <ShoppingBag className="w-5 h-5" /> Mis pedidos
          </Link>
          <Link 
            href="/" 
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Volver al inicio <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
