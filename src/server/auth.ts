// src/server/auth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";


export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    // 1. Interceptamos el login para registrar al usuario en la DB
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          console.log("Usuario intentando loguearse con Google:", user);
          const email = user.email;
          const nombre = user.name;
          const id = crypto.randomUUID();

          // Verificamos si el usuario ya existe
          const { rows } = await db.query(
            "SELECT id FROM usuario WHERE email = $1",
            [email]
          );

          // Si no existe, lo insertamos (Registro automático)
          if (rows.length === 0) {
            await db.query(
              `INSERT INTO usuario (id, nombre, email, rol, suscrito) 
               VALUES ($1, $2, $3, 'cliente', true)`,
              [id, nombre, email]
            );
          }

          return true; // Permitimos que el login continúe
        } catch (error) {
          console.error("Error al registrar usuario con Google:", error);
          return false; // Bloqueamos el login si falla la base de datos
        }
      }
      return true;
    },

    // 2. Enriquecemos el Token con los datos de tu tabla
    async jwt({ token, user, trigger }) {
      // Solo hacemos la consulta a la DB la primera vez que se loguea (user existe)
      if (user || trigger === "signIn") {
        const { rows } = await db.query(
          "SELECT id, rol FROM usuario WHERE email = $1",
          [token.email]
        );

        if (rows.length > 0) {
          token.dbId = rows[0].id;
          token.rol = rows[0].rol;
        }
      }
      return token;
    },

    // 3. Pasamos esos datos a la sesión del Frontend
    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error Agregamos propiedades custom a la sesión
        session.user.id = token.dbId;
        // @ts-expect-error
        session.user.rol = token.rol;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});