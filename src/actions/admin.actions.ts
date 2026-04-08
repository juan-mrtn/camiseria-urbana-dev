// src/actions/admin.actions.ts
"use server";

import { auth } from "@/server/auth";
import { AdminRepository, NuevoProductoDTO, NuevoIngresoStockDTO } from "@/repositories/admin.repository";
import { revalidatePath } from "next/cache";

// Acción para el PBI-23
export async function crearProductoAction(datosDelFormulario: NuevoProductoDTO) {
  const session = await auth();
  
  // Validamos seguridad: ¿Existe la sesión y es rol Admin?
  if (!session || session.user?.rol !== 'admin') {
    throw new Error("Acceso denegado. Se requieren permisos de administrador.");
  }

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
    varianteId: formData.get("varianteId") as string,
    cantidad: parseInt(formData.get("cantidad") as string),
    costo: parseFloat(formData.get("costo") as string),
  };

  await AdminRepository.registrarIngresoStock(datosIngreso);
  
  revalidatePath("/(shop)/productos/[id]", "page"); // Actualiza la vista de detalles
  revalidatePath("/(admin)/dashboard/stock", "page");
}