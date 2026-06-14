// src/providers/CartProvider.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Definimos la estructura de un producto dentro del carrito
export interface CartItem {
  id: string; // Usaremos un ID temporal combinado (ej: nombre + talle)
  nombre: string;
  precio: number;
  precioOriginal?: number;
  talle: string;
  cantidad: number;
  imagen_url: string;
  stock_disponible?: number;
  promocion?: {
    tipo: string;
    descuento?: number;
  } | null;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar desde localStorage al iniciar
  useEffect(() => {
    try {
      const local = localStorage.getItem("cart_items");
      if (local) {
        setItems(JSON.parse(local));
      }
    } catch (e) {
      console.error("Error loading cart from local storage", e);
    }
    setIsInitialized(true);
  }, []);

  // Guardar en localStorage cada vez que cambia items
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cart_items", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToCart = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Verificamos si ya existe el mismo producto con el mismo talle
      const existingItem = prevItems.find((item) => item.id === newItem.id);
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === newItem.id
            ? { ...item, cantidad: item.cantidad + newItem.cantidad }
            : item
        );
      }
      return [...prevItems, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce((total, item) => {
    let lineTotal = item.precio * item.cantidad; // Fallback a precio actual
    
    // Si tenemos el precio original, lo usamos como base para calcular los descuentos reales
    const basePrice = item.precioOriginal || item.precio;

    if (item.promocion?.tipo === '2x1') {
      const pagables = Math.floor(item.cantidad / 2) + (item.cantidad % 2);
      lineTotal = basePrice * pagables;
    } else if (item.promocion?.tipo === 'descuento' && item.promocion.descuento) {
      lineTotal = basePrice * (1 - item.promocion.descuento / 100) * item.cantidad;
    }
    
    return total + lineTotal;
  }, 0);

  const cartCount = items.reduce((count, item) => count + item.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
};