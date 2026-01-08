// src/server/auth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Aquí vincularemos la sesión con tu base de datos más adelante
      return session;
    },
  },
  pages: {
    signIn: "/login", // Ruta definida en tu estructura [cite: 1726]
  },
});