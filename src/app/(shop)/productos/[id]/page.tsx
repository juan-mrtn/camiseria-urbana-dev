// src/app/(shop)/productos/[id]/page.tsx
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/productos/ProductDetail';
import { ProductoRepository } from '@/repositories/producto.repository';
import { FavoritoRepository } from '@/repositories/favorito.repository';
import { auth } from '@/server/auth';

interface PageProps {
  params: Promise<{ id: string; }>;
}

export default async function PaginaDetalleProducto({ params }: PageProps) {
  const session = await auth();
  const productoId = (await params).id;
  
  const productos = await ProductoRepository.getById(productoId);
  if (!productos) notFound();

  // Obtener array de IDs de variantes favoritas del usuario para este producto
  let favoritosDelProducto: string[] = [];
  if (session?.user?.id) {
    const allFavs = await FavoritoRepository.getFavoritosPorUsuario(session.user.id);
    favoritosDelProducto = allFavs
      .map(f => f.producto_variante_id)
      .filter(id => productos.variantes.some(v => v.id === id));
  }

  return (
    <div className="bg-white min-h-screen">
      <ProductDetail producto={productos} favoritosIniciales={favoritosDelProducto} />
    </div>
  );
}