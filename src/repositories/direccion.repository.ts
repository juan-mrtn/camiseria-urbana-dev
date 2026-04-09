// src/repositories/direccion.repository.ts
import { db } from "@/lib/db";

export interface DireccionDTO {
  usuarioId: string;
  titulo: string;
  calle: string;
  numero: string;
  departamento?: string;
  codigoPostal: string;
  ciudad: string;
  provincia: string;
  principal: boolean;
}

export const DireccionRepository = {
  async getByUsuarioId(usuarioId: string) {
    try {
      const query = `
        SELECT id, titulo, calle, numero, departamento, codigo_postal, ciudad, provincia, principal 
        FROM direccion WHERE usuario_id = $1 ORDER BY principal DESC, id ASC
      `;
      const result = await db.query(query, [usuarioId]);
      
      return result.rows.map(row => ({
        id: row.id,
        titulo: row.titulo,
        calle: row.calle,
        numero: row.numero || '',
        departamento: row.departamento || null,
        codigoPostal: row.codigo_postal,
        ciudad: row.ciudad,
        provincia: row.provincia,
        principal: row.principal
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async clearPrincipal(usuarioId: string) {
    await db.query(`UPDATE direccion SET principal = FALSE WHERE usuario_id = $1`, [usuarioId]);
  },

  async create(data: DireccionDTO) {
    const id = `DIR-${crypto.randomUUID().slice(0, 8)}`;
    if (data.principal) await this.clearPrincipal(data.usuarioId);

    const query = `
      INSERT INTO direccion (id, usuario_id, titulo, calle, numero, departamento, codigo_postal, ciudad, provincia, principal)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    await db.query(query, [id, data.usuarioId, data.titulo, data.calle, data.numero, data.departamento, data.codigoPostal, data.ciudad, data.provincia, data.principal]);
  },

  async update(id: string, data: Partial<DireccionDTO>, usuarioId: string) {
    if (data.principal) await this.clearPrincipal(usuarioId);

    const query = `
      UPDATE direccion SET 
        titulo = $1, calle = $2, numero = $3, departamento = $4, 
        codigo_postal = $5, ciudad = $6, provincia = $7, principal = $8
      WHERE id = $9 AND usuario_id = $10
    `;
    await db.query(query, [data.titulo, data.calle, data.numero, data.departamento, data.codigoPostal, data.ciudad, data.provincia, data.principal, id, usuarioId]);
  },

  async delete(id: string, usuarioId: string) {
    await db.query(`DELETE FROM direccion WHERE id = $1 AND usuario_id = $2`, [id, usuarioId]);
  },
  
  async setPrincipal(id: string, usuarioId: string) {
    await this.clearPrincipal(usuarioId);
    await db.query(`UPDATE direccion SET principal = TRUE WHERE id = $1 AND usuario_id = $2`, [id, usuarioId]);
  }
};