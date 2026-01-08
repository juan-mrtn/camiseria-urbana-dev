// src/app/producto/[id]/page.tsx
import ProductDetail from '@/components/productos/ProductDetail';

// Datos de prueba para previsualizar el layout [cite: 1570, 1585]
const PRODUCTO_MOCK = {
  nombre: "Camisa Premium Algodón Blanca",
  precio: 9999,
  descripcion: "Tejido suave y respirable, corte moderno para uso diario. Calidad premium garantizada para larga durabilidad.",
  talles: ["S", "M", "L", "XL"],
  imagenes: [
    "https://via.placeholder.com/600x800?text=Principal",
    "https://via.placeholder.com/600x800?text=Vista+2",
    "https://via.placeholder.com/600x800?text=Vista+3",
    "https://via.placeholder.com/600x800?text=Detalle"
  ],
  opinionesCount: 42
};

export default function PaginaDetalleProducto() {
  return (
    <div className="bg-white min-h-screen">
      <ProductDetail producto={PRODUCTO_MOCK} />
    </div>
  );
}