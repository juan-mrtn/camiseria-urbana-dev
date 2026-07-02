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
          primary: "#57883bff",   // Indigo para botones "Agregar" [cite: 1338]
          secondary: "#abdd21ff", // Naranja para etiquetas de "Oferta" [cite: 1348]
          dark: "#1e1b4b",      // Azul oscuro para textos o headers
        },
        indigo: {
          50: '#f4f7f4',
          100: '#e5ebe5',
          200: '#c2d2c2',
          300: '#a3baa3',
          400: '#7fa17f',
          500: '#90A955',
          600: '#31572C',
          700: '#90A955', // para que hover:bg-indigo-700 sea #90A955
          800: '#233e20',
          900: '#152513',
        },
        orange: {
          50: '#fefef2',
          100: '#fdfde6',
          200: '#fafaa3',
          300: '#f8f870',
          400: '#f5f548',
          500: '#f2f230',
          600: '#dada20',
          700: '#8c8c00',
          800: '#696900',
          900: '#464600',
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
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 500ms ease-out',
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'), // Para animaciones suaves en modales y transiciones [cite: 1355]
  ],
};

export default config;