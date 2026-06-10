"use server";

import { auth } from "@/server/auth";
import { CarritoRepository } from "@/repositories/carrito.repository";
import { revalidatePath } from "next/cache";

export async function addToCartAction(productoVarianteId: string, cantidad: number, precioUnitario: number) {
    const session = await auth();

    // Si el usuario no está logueado, no hacemos nada en DB, se manejará en el Contexto local.
    if (!session || !session.user?.id) {
        return { success: false, error: "not_logged_in" };
    }

    try {
        await CarritoRepository.agregarItemAlCarrito(
            session.user.id,
            productoVarianteId,
            cantidad,
            precioUnitario
        );

        // Actualiza mágicamente el badge del carrito y cualquier página que dependa de esto
        revalidatePath("/", "layout");

        return { success: true };
    } catch (error) {
        console.error("Error al sincronizar carrito con DB:", error);
        return { success: false, error: "db_error" };
    }
}
