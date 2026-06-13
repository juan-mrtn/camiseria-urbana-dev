// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  // Permitir la conexión HMR de Next.js cuando se usa Ngrok
  allowedDevOrigins: [
    'mower-collar-jaywalker.ngrok-free.dev',
    // Puedes añadir otros dominios aquí si ngrok cambia de URL
  ],
};

export default nextConfig;