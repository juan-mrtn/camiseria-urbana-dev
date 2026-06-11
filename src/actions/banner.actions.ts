"use server";

import { revalidatePath } from "next/cache";
import { BannerRepository } from "@/repositories/banner.repository";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { auth } from "@/server/auth";

export async function createBannerAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session || session.user?.rol !== 'admin') {
      throw new Error("Acceso denegado. Se requieren permisos de administrador.");
    }

    const titulo = formData.get("titulo") as string;
    const subtitulo = formData.get("subtitulo") as string;
    const boton_texto = formData.get("destino") as string || "coleccion";
    const productosJSON = formData.get("productos") as string;
    const productos = productosJSON ? JSON.parse(productosJSON) : [];
    
    // Manejo de la imagen
    const imageFile = formData.get("imagen") as File;
    let imagen_url = "";

    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${crypto.randomUUID()}_banner.webp`;
      const filepath = path.join(uploadDir, filename);

      // Usamos sharp para optimizar la imagen para banner (aspect ratio ancho)
      await sharp(buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 100 })
        .toFile(filepath);

      imagen_url = `/uploads/${filename}`;
    } else {
      throw new Error("La imagen es obligatoria para el banner.");
    }

    const newId = await BannerRepository.createBanner({
      titulo,
      subtitulo,
      boton_texto,
      imagen_url,
      activo: true,
      orden: 0,
      productos
    });
    
    // Revalidar las rutas afectadas
    revalidatePath("/");
    revalidatePath("/admin/dashboard/banners");
    
    return { success: true, id: newId };
  } catch (error: any) {
    console.error("Error creating banner:", error);
    return { success: false, error: error.message || "Error al crear el banner" };
  }
}

export async function deleteBannerAction(id: string) {
  try {
    const session = await auth();
    if (!session || session.user?.rol !== 'admin') {
      throw new Error("Acceso denegado. Se requieren permisos de administrador.");
    }

    await BannerRepository.deleteBanner(id);
    
    // Revalidar las rutas afectadas
    revalidatePath("/");
    revalidatePath("/admin/dashboard/banners");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting banner:", error);
    return { success: false, error: error.message || "Error al eliminar el banner" };
  }
}
