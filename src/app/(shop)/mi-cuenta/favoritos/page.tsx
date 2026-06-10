import Image from "next/image";
import Link from "next/link";
import { Trash2, Eye, ArrowLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { auth } from "@/server/auth";
import { FavoritoRepository } from "@/repositories/favorito.repository";
import { eliminarFavoritoAction } from "@/actions/favorito.actions";

export default async function FavoritosPage() {
    const session = await auth();

    // Si no hay sesión, podrías redirigir al login
    if (!session?.user) {
        return <div className="text-center py-20 font-bold">Debes iniciar sesión para ver tus favoritos.</div>;
    }

    // Traemos los datos reales de la base de datos
    const favoritos = await FavoritoRepository.getFavoritosPorUsuario(session.user.id);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-black">Inicio</Link>
                <ChevronRight className="w-4 h-4 mx-2" />
                <Link href="/mi-cuenta" className="hover:text-black">Mi Cuenta</Link>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="text-gray-900 font-medium">Favoritos</span>
            </nav>

            <div className="border rounded-xl p-6 mb-8 bg-white shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Mis productos favoritos</h1>
                <p className="text-gray-500 mt-1">
                    {favoritos.length === 1 ? '1 producto guardado' : `${favoritos.length} productos guardados`}
                </p>
            </div>

            <div className="space-y-4">
                {favoritos.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border">
                        Aún no tienes productos en favoritos.
                    </div>
                ) : (
                    favoritos.map((producto) => (
                        <div
                            key={producto.favorito_id}
                            className="flex flex-col md:flex-row items-center border rounded-xl p-4 bg-white shadow-sm gap-6 transition hover:shadow-md"
                        >
                            {/* Imagen con fallback seguro */}
                            <div className="relative w-32 h-32 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                                {producto.imagen_url && (producto.imagen_url.startsWith('/') || producto.imagen_url.startsWith('http')) ? (
                                    <Image
                                        src={producto.imagen_url}
                                        alt={producto.nombre}
                                        fill
                                        sizes="128px"
                                        className="object-cover"
                                        unoptimized={!producto.imagen_url.startsWith('/')} // Evita errores de hostname en next.config si es externa
                                    />
                                ) : (
                                    // Fallback seguro usando icono de lucide-react
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 border rounded-lg">
                                        <ImageIcon className="w-8 h-8 mb-1" />
                                        <span className="text-[10px] text-center px-1 font-medium">Sin imagen</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 w-full text-left">
                                <h3 className="font-bold text-lg text-gray-900">{producto.nombre}</h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="font-semibold text-gray-900">
                                        ${Number(producto.precio).toLocaleString('es-AR')}
                                    </span>
                                    {/* El stock lo dejamos estático hasta que lo enlaces con tu función de stock real */}
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                        Disponible
                                    </span>
                                </div>

                                {/* Estrellas Reales */}
                                <div className="flex items-center gap-1 mt-3 text-gray-300 text-sm">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} className={star <= Math.round(producto.rating) ? "text-violet-900" : ""}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 shrink-0">
                                <Link
                                    href={`/productos/${producto.producto_id}`}
                                    className="flex items-center justify-center gap-2 bg-[#6D28D9] hover:bg-violet-800 text-white px-5 py-2.5 rounded-lg font-medium transition"
                                >
                                    <Eye className="w-4 h-4" />
                                    Ver producto
                                </Link>

                                {/* Formulario para ejecutar la Server Action de Eliminar */}
                                <form action={eliminarFavoritoAction.bind(null, producto.favorito_id)}>
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 px-5 py-2.5 rounded-lg font-medium transition border"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Eliminar
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-8">
                <Link
                    href="/catalogo"
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-6 py-3 rounded-lg transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al catálogo
                </Link>
            </div>
        </div>
    );
}