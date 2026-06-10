"use server";

import { auth } from "@/server/auth";
import { FavoritoRepository } from "@/repositories/favorito.repository";
import { revalidatePath } from "next/cache";

export async function eliminarFavoritoAction(favoritoId: string) {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error("Debes iniciar sesión");
    }

    await FavoritoRepository.eliminarFavorito(favoritoId, session.user.id);

    // Refresca la página al instante
    revalidatePath("/(shop)/mi-cuenta/favoritos", "page");
}

export async function toggleFavoritoAction(producto_variante_id: string) {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error("Debes iniciar sesión para agregar a favoritos");
    }

    const newState = await FavoritoRepository.toggleFavorito(session.user.id, producto_variante_id);

    // Refrescar el detalle del producto y la lista de favoritos
    revalidatePath(`/productos/${producto_variante_id}`, "page");
    revalidatePath("/mi-cuenta/favoritos", "page");
    
    return newState;
}