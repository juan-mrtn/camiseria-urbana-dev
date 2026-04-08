// src/actions/direccion.actions.ts
"use server";
import { auth } from "@/server/auth";
import { DireccionRepository } from "@/repositories/direccion.repository";
import { revalidatePath } from "next/cache";

export async function saveDireccionAction(formData: FormData, direccionId?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const data = {
    usuarioId: session.user.id,
    titulo: formData.get("titulo") as string,
    calle: formData.get("calle") as string,
    numero: formData.get("numero") as string || "S/N",
    departamento: formData.get("departamento") as string,
    codigoPostal: formData.get("codigoPostal") as string,
    ciudad: formData.get("ciudad") as string,
    provincia: formData.get("provincia") as string,
    principal: formData.get("principal") === "on", 
  };

  if (direccionId) {
    await DireccionRepository.update(direccionId, data, session.user.id);
  } else {
    await DireccionRepository.create(data);
  }

  // Refresca la página automáticamente
  revalidatePath("/perfil"); 
}

export async function deleteDireccionAction(id: string) {
  const session = await auth();
  if (session?.user?.id) {
    await DireccionRepository.delete(id, session.user.id);
    revalidatePath("/perfil");
  }
}

export async function setPrincipalAction(id: string) {
  const session = await auth();
  if (session?.user?.id) {
    await DireccionRepository.setPrincipal(id, session.user.id);
    revalidatePath("/perfil");
  }
}