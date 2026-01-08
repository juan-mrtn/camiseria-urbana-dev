// src/app/(auth)/login/page.tsx
import { signIn } from "@/server/auth";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto my-20 p-8 border border-gray-100 rounded-lg bg-white shadow-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-tighter">
          Bienvenido <span className="text-indigo-600">Nuevamente</span>
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Ingresa a tu cuenta para gestionar tus pedidos.
        </p>
      </div>

      {/* Caso de Uso: Login con Google */}
      <form
        action={async () => {
          "use server"
          await signIn("google", { redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-3 border-2 border-gray-900 py-3 rounded-md hover:bg-gray-900 hover:text-white transition-all duration-300 font-bold uppercase text-xs tracking-widest"
        >
          <img 
            src="https://authjs.dev/img/providers/google.svg" 
            alt="Google" 
            className="w-5 h-5" 
          />
          Ingresar con Google
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          ¿Aún no tienes cuenta en La Camisería?
        </p>
        <Link 
          href="/register" 
          className="inline-block mt-2 text-indigo-600 hover:underline font-bold text-sm"
        >
          Crea tu cuenta aquí
        </Link>
      </div>
    </div>
  );
}