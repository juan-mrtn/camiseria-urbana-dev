// src/actions/usuario.actions.ts
"use server";

import { auth } from "@/server/auth";
import { UsuarioRepository } from "@/repositories/usuario.repository";
import { revalidatePath } from "next/cache";

export async function toggleNewsletterAction(estadoActual: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  // Llamamos al repositorio
  await UsuarioRepository.toggleSuscripcion(session.user.id, estadoActual);
  
  // Refrescamos la página de perfil para que traiga el nuevo estado de la BD
  revalidatePath("/perfil"); 
}