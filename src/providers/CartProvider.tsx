// src/providers/CartProvider.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Definimos la estructura de un producto dentro del carrito
export interface CartItem {
  id: string; // Usaremos un ID temporal combinado (ej: nombre + talle)
  nombre: string;
  precio: number;
  talle: string;
  cantidad: number;
  imagen_url: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

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

  const cartTotal = items.reduce((total, item) => total + item.precio * item.cantidad, 0);
  const cartCount = items.reduce((count, item) => count + item.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, cartTotal, cartCount }}>
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