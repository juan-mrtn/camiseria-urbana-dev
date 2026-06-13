import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { CheckCircle2, ShoppingBag, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export default async function CheckoutSuccessPage(props: {
  searchParams: Promise<{ status?: string, collection_status?: string, payment_status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const usuarioId = session.user.id;
  
  const status = searchParams?.status || searchParams?.collection_status || searchParams?.payment_status;
  const isApproved = status === "approved";

  // Nota: La confirmación del pago en la base de datos y el envío del correo electrónico
  // ahora son manejados EXCLUSIVAMENTE por el Webhook de Mercado Pago (/api/webhooks/mercadopago)
  // para evitar condiciones de carrera (envío de correos duplicados).

  return (
    <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        
        {isApproved ? (
          <>
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                ¡Pago aprobado con éxito!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Tu pago ha sido procesado correctamente. En unos instantes recibirás un correo electrónico con la factura detallada de tu compra y los pasos a seguir.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">¿Qué sigue?</h3>
              <ul className="text-sm text-gray-600 text-left space-y-3">
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600">1.</span>
                  Te enviaremos un correo con los detalles de tu compra.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600">2.</span>
                  Podrás hacer el seguimiento de tu envío desde tu cuenta.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600">3.</span>
                  ¡Disfruta de tus nuevas prendas de La Camisería Urbana!
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
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
                Tu pago está siendo procesado por Mercado Pago o aún no ha sido completado.
                Te notificaremos cuando el pago sea confirmado.
              </p>
            </div>
          </>
        )}

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
