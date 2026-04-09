// src/app/(shop)/productos/[id]/page.tsx
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/productos/ProductDetail';
import { ProductoRepository } from '@/repositories/producto.repository';

interface PageProps {
  params: Promise<{ id: string; }>;
}

export default async function PaginaDetalleProducto({ params }: PageProps) {

  const productos = await ProductoRepository.getById((await params).id);
  console.log("Producto encontrado:", productos); // Debug: Ver qué producto se obtuvo

  if (!productos) notFound();

  return (
    <div className="bg-white min-h-screen">
      <ProductDetail producto={productos} />
    </div>
  );
}