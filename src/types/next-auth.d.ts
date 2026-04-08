// src/types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  // Extendemos la interfaz Session
  interface Session {
    user: {
      id: string; // Tu token.dbId
      rol: string; // Tu token.rol
    } & DefaultSession["user"]
  }
}