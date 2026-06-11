// src/components/shop/PromoCarousel.tsx
import { ProductoRepository } from "@/repositories/producto.repository";
import PromoCarouselClient from "./PromoCarouselClient";

export default async function PromoCarousel() {
  const productos = await ProductoRepository.getProductosEnPromocion();

  if (!productos || productos.length === 0) {
    return null; // No renderizamos nada si no hay promociones
  }

  return <PromoCarouselClient productos={productos} />;
}
