// src/repositories/usuario.repository.ts
import { db } from "@/lib/db";

export const UsuarioRepository = {
  
  async getByEmail(email: string) {
    try {
      // Usamos la misma estructura de la tabla de tu base de datos
      const query = `
        SELECT id, nombre, email, rol, suscrito 
        FROM usuario 
        WHERE email = $1
      `;
      
      const result = await db.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      // Formateamos y tipamos la respuesta
      return {
        id: row.id,
        nombre: row.nombre,
        email: row.email,
        rol: row.rol,
        suscrito: row.suscrito // boolean
      };

    } catch (error) {
      console.error("UsuarioRepository.getByEmail error:", error);
      throw new Error("Error al obtener los datos del usuario");
    }
  },
  async toggleSuscripcion(id: string, estadoActual: boolean) {
    try {
      // Invertimos el estado: si estaba true pasa a false, y viceversa
      const nuevoEstado = !estadoActual; 
      
      await db.query(
        `UPDATE usuario SET suscrito = $1 WHERE id = $2`,
        [nuevoEstado, id]
      );
      
      return nuevoEstado;
    } catch (error) {
      console.error("Error al actualizar suscripción:", error);
      throw new Error("No se pudo actualizar la suscripción");
    }
  }
};