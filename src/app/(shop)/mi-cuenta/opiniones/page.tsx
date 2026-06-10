import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Image as ImageIcon, ShoppingBag } from "lucide-react";
import { auth } from "@/server/auth";
import { OpinionRepository } from "@/repositories/opinion.repository";
import ReviewForm from "@/components/shop/ReviewForm";

export default async function OpinionesPage() {
    const session = await auth();

    if (!session?.user) {
        return <div className="text-center py-20 font-bold">Debes iniciar sesión para ver tus opiniones.</div>;
    }

    const pendingReviews = await OpinionRepository.getPendingReviews(session.user.id);
    const completedReviews = await OpinionRepository.getCompletedReviews(session.user.id);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-black transition-colors">Inicio</Link>
                <ChevronRight className="w-4 h-4 mx-2" />
                <Link href="/mi-cuenta" className="hover:text-black transition-colors">Mi Cuenta</Link>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="text-gray-900 font-medium">Mis Opiniones</span>
            </nav>

            <div className="border border-gray-200 rounded-xl p-6 mb-8 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-xl font-bold text-gray-900">Historial de mis opiniones</h1>
                <p className="text-sm text-gray-500">Consulta tu actividad y comparte tu experiencia</p>
            </div>

            {/* Pendientes por calificar */}
            {pendingReviews.length > 0 && (
                <div className="mb-8 border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                    <h2 className="text-base font-semibold text-gray-800 mb-5">Productos pendientes por calificar</h2>
                    <div className="space-y-6">
                        {pendingReviews.map((item) => (
                            <div key={item.producto_variante_id} className="border border-gray-100 rounded-xl p-5 bg-gray-50/50 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="relative w-16 h-16 shrink-0 bg-white rounded-md overflow-hidden border border-gray-200">
                                        {item.imagen_url && (item.imagen_url.startsWith('/') || item.imagen_url.startsWith('http')) ? (
                                            <Image
                                                src={item.imagen_url}
                                                alt={item.nombre}
                                                fill
                                                sizes="64px"
                                                className="object-cover"
                                                unoptimized={!item.imagen_url.startsWith('/')}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">{item.nombre}</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Comprado: {new Date(item.fecha_compra).toLocaleDateString('es-AR')}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Formulario Cliente */}
                                <ReviewForm productoVarianteId={item.producto_variante_id} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Historial de calificaciones */}
            <div>
                <h2 className="text-base font-semibold text-gray-800 mb-4">Historial de calificaciones</h2>
                {completedReviews.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-200">
                        Aún no tienes opiniones publicadas.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {completedReviews.map((review) => (
                            <div key={review.id} className="border border-gray-200 rounded-xl p-5 bg-white flex items-start gap-4 shadow-sm hover:shadow-md transition">
                                <div className="relative w-16 h-16 shrink-0 bg-gray-50 rounded-md overflow-hidden border border-gray-200">
                                    {review.imagen_url && (review.imagen_url.startsWith('/') || review.imagen_url.startsWith('http')) ? (
                                        <Image
                                            src={review.imagen_url}
                                            alt={review.nombre}
                                            fill
                                            sizes="64px"
                                            className="object-cover"
                                            unoptimized={!review.imagen_url.startsWith('/')}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-gray-900">{review.nombre}</h3>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        {/* Estrellas Dadas (Simulando la pastilla negra con estrellitas de figma) */}
                                        <div className="flex items-center gap-0.5 bg-gray-900 px-2 py-0.5 rounded text-white text-[10px]">
                                            {'★'.repeat(review.estrellas)}
                                        </div>
                                        <p className="text-sm text-gray-700">"{review.comentario}"</p>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-2">
                                        Calificado el: {new Date(review.fecha).toLocaleDateString('es-AR')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="mt-10 flex justify-center">
                <Link
                    href="/catalogo"
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-6 py-2.5 rounded-lg transition text-sm border border-gray-200 shadow-sm"
                >
                    <ShoppingBag className="w-4 h-4" />
                    Ver el catálogo
                </Link>
            </div>
        </div>
    );
}
