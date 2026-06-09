// src/actions/admin.actions.ts
"use server";

import { auth } from "@/server/auth";
import { AdminRepository, NuevoProductoDTO, NuevoIngresoStockDTO, NuevaVarianteDTO } from "@/repositories/admin.repository";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

import sharp from "sharp";

// Acción para el PBI-23
export async function crearProductoAction(formData: FormData) {
  const session = await auth();

  // Validamos seguridad: ¿Existe la sesión y es rol Admin?
  if (!session || session.user?.rol !== 'admin') {
    throw new Error("Acceso denegado. Se requieren permisos de administrador.");
  }

  const productoId = formData.get("productoId") as string;
  const variantesCount = parseInt(formData.get("variantesCount") as string || "0");

  const variantes: NuevaVarianteDTO[] = [];

  for (let i = 0; i < variantesCount; i++) {
    const talle = formData.get(`variante_${i}_talle`) as string;
    const color = formData.get(`variante_${i}_color`) as string;
    const material = formData.get(`variante_${i}_material`) as string;
    const precio = parseFloat(formData.get(`variante_${i}_precio`) as string);
    const imagenFiles = formData.getAll(`variante_${i}_imagen`) as File[];

    const imagenUrls: string[] = [];

    if (imagenFiles && imagenFiles.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const uploadPromises = imagenFiles.map(async (file) => {
        if (file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const filename = `${crypto.randomUUID()}.webp`;
          const filepath = path.join(uploadDir, filename);

          await sharp(buffer)
            .resize(800, 1000, { fit: 'cover' })
            .webp({ quality: 80 })
            .toFile(filepath);

          return `/uploads/${filename}`;
        }
        return null;
      });

      const results = await Promise.all(uploadPromises);
      results.forEach(url => {
        if (url) imagenUrls.push(url);
      });
    }

    variantes.push({ talle, color, material, precio, imagenUrls });
  }

  const datosDelFormulario: NuevoProductoDTO = {
    productoId,
    variantes
  };

  // Ejecutamos la transacción
  await AdminRepository.crearProductoConVariantes(datosDelFormulario);

  // Refrescamos el catálogo y la tabla del dashboard
  revalidatePath("/(shop)/catalogo", "page");
  revalidatePath("/(admin)/dashboard/productos", "page");
}

// Acción para el PBI-24
export async function registrarStockAction(formData: FormData) {
  const session = await auth();

  if (!session || session.user?.rol !== 'admin') {
    throw new Error("Acceso denegado.");
  }

  const datosIngreso: NuevoIngresoStockDTO = {
    proveedorId: formData.get("proveedorId") as string,
    nombreProducto: formData.get("nombreProducto") as string,
    talle: formData.get("talle") as string,
    cantidad: parseInt(formData.get("cantidad") as string),
    costoUnitario: parseFloat(formData.get("costoUnitario") as string),
  };

  await AdminRepository.registrarIngresoStock(datosIngreso);

  revalidatePath("/(shop)/productos/[id]", "page"); // Actualiza la vista de detalles
  revalidatePath("/(admin)/dashboard/stock", "page");
}

export async function getExistingProductCodesAction() {
  const session = await auth();
  if (!session || session.user?.rol !== 'admin') {
    throw new Error("Acceso denegado.");
  }
  return await AdminRepository.getExistingProductCodes();
}

export async function crearProveedorAction(formData: FormData) {
  const session = await auth();
  if (!session || session.user?.rol !== 'admin') throw new Error("Acceso denegado.");
  const nombre = formData.get("nombre") as string;
  const contacto = formData.get("contacto") as string;
  await AdminRepository.crearProveedor(nombre, contacto);
  revalidatePath("/(admin)/dashboard", "page");
}

export async function crearProductoBaseAction(formData: FormData) {
  const session = await auth();
  if (!session || session.user?.rol !== 'admin') throw new Error("Acceso denegado.");
  const nombre = formData.get("nombre") as string;
  const descripcion = formData.get("descripcion") as string;
  const codigo = formData.get("codigo") as string;
  await AdminRepository.crearProductoBase(nombre, descripcion, codigo);
  revalidatePath("/(admin)/dashboard/productos/nuevo", "page");
}

export async function getProveedoresAction() {
  const session = await auth();
  if (!session || session.user?.rol !== 'admin') throw new Error("Acceso denegado.");
  return await AdminRepository.getProveedores();
}

export async function getProductosBaseAction() {
  const session = await auth();
  if (!session || session.user?.rol !== 'admin') throw new Error("Acceso denegado.");
  return await AdminRepository.getProductosBase();
}

export async function getUnallocatedStockAction(productoId: string) {
  const session = await auth();
  if (!session || session.user?.rol !== 'admin') throw new Error("Acceso denegado.");
  return await AdminRepository.getUnallocatedStock(productoId);
}

export async function getAllVariantesAction() {
  const session = await auth();
  if (!session || session.user?.rol !== 'admin') throw new Error("Acceso denegado.");
  return await AdminRepository.getAllVariantes();
}