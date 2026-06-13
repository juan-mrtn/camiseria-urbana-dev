"use server";

import { auth } from "@/server/auth";
import { CompraRepository } from "@/repositories/compra.repository";

export async function getPurchaseHistoryAction() {
  try {
    const session = await auth();
    
    // Authenticate the user securely
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "No autorizado" };
    }

    // Invoke repository to fetch structured purchase data
    const compras = await CompraRepository.obtenerHistorialCompras(session.user.id);
    
    return { success: true, compras };
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    return { success: false, error: "Error interno al obtener compras" };
  }
}
