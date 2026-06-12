import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SessionProvider from '@/providers/SessionProvider';
import { CartProvider } from '@/providers/CartProvider';
import CartBadgeIcon from '@/components/ui/CartBadgeIcon';

export const metadata: Metadata = {
  title: 'La Camisería Urbana',
  description: 'Tienda online de camisas de calidad y estilo urbano.',
};
// import global styles
import '@/styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <CartProvider>
          <SessionProvider>
            <Header cartBadge={<CartBadgeIcon />} />
            <main className="flex-1">
              {children}:
            </main>
            <Footer />
          </SessionProvider>
        </CartProvider>
      </body>
    </html>
  );
}