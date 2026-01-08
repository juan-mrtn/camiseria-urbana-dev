// src/app/(auth)/register/page.tsx
import { signIn } from "@/server/auth";

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto my-20 p-8 border rounded-lg bg-white shadow-sm">
      <h1 className="text-2xl font-bold mb-2">Crea una cuenta</h1>
      <p className="text-sm text-gray-600 mb-8">
        Regístrate para agilizar tus futuras compras. [cite: 1718]
      </p>

      <form
        action={async () => {
          "use server"
          await signIn("google", { redirectTo: "/" })
        }}
      >
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-3 border py-3 rounded-md hover:bg-gray-50 transition font-medium"
        >
          {/* Icono de Google */}
          <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-5 h-5" />
          Registrar con Google [cite: 1722]
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tienes una cuenta?{" "}
        <a href="/login" className="text-indigo-600 hover:underline font-bold">
          Inicia sesión [cite: 1725]
        </a>
      </div>
    </div>
  );
}