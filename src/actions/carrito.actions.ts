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

export async function removeFromCartAction(productoVarianteId: string) {
    const session = await auth();

    // Si el usuario no está logueado, no hacemos nada en DB
    if (!session || !session.user?.id) {
        return { success: false, error: "not_logged_in" };
    }

    try {
        await CarritoRepository.eliminarItemDelCarrito(session.user.id, productoVarianteId);

        // Actualiza el badge del carrito
        revalidatePath("/", "layout");

        return { success: true };
    } catch (error) {
        console.error("Error al eliminar item del carrito en DB:", error);
        return { success: false, error: "db_error" };
    }
}

export async function aplicarCuponAction(codigoCupon: string) {
    const session = await auth();
    if (!session || !session.user?.id) {
        return { success: false, error: "Debes iniciar sesión para aplicar cupones." };
    }

    const codigo = codigoCupon.toUpperCase().trim();

    try {
        const carritoId = await CarritoRepository.getCarritoAbiertoId(session.user.id);
        if (!carritoId) {
            return { success: false, error: "No tienes un carrito activo." };
        }

        const promoValida = await CarritoRepository.validarPromocion(codigo);
        if (!promoValida) {
            return { success: false, error: "Cupón vencido o inexistente" };
        }

        await CarritoRepository.aplicarPromocionACarrito(carritoId, codigo);

        revalidatePath("/(shop)/carrito", "page");
        revalidatePath("/", "layout");
        
        return { success: true };
    } catch (error) {
        console.error("Error al aplicar cupón:", error);
        return { success: false, error: "Error al aplicar el cupón. Intenta nuevamente." };
    }
}
