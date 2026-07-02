// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dxxuqxba4/**',
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
  ],
};

export default nextConfig;