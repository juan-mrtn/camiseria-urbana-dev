"use server";

import { auth } from "@/server/auth";
import { OpinionRepository } from "@/repositories/opinion.repository";
import { revalidatePath } from "next/cache";

export async function crearOpinionAction(productoVarianteId: string, estrellas: number, comentario: string) {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error("Debes iniciar sesión para dejar una opinión");
    }

    if (estrellas < 1 || estrellas > 5) {
        throw new Error("La calificación debe estar entre 1 y 5 estrellas");
    }

    if (!comentario || comentario.trim() === "") {
        throw new Error("El comentario no puede estar vacío");
    }

    await OpinionRepository.crearOpinion(session.user.id, productoVarianteId, estrellas, comentario.trim());

    // Refrescar la página de opiniones y el detalle de producto
    revalidatePath("/(shop)/mi-cuenta/opiniones", "page");
    revalidatePath(`/(shop)/productos/${productoVarianteId}`, "page");
}
