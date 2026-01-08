// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  // Asegúrate de que Tailwind escanee todos tus componentes y páginas
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados basados en tus Mockups [cite: 1324]
        brand: {
          primary: "#4f46e5",   // Indigo para botones "Agregar" [cite: 1338]
          secondary: "#f97316", // Naranja para etiquetas de "Oferta" [cite: 1348]
          dark: "#1e1b4b",      // Azul oscuro para textos o headers
        },
        // Configuración para el Modo Oscuro (PBI-20) [cite: 1023]
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // Espaciados y bordes acordes al estilo limpio del catálogo [cite: 1368]
      borderRadius: {
        'lg': '0.5rem',
        'md': '0.375rem',
        'sm': '0.125rem',
      },
    },
  },
  plugins: [],
};

export default config;