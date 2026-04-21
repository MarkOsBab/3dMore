"use client";

import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { ShoppingCart, Check } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string | null;
  isOffer: boolean;
  discountPct: number | null;
}

export default function ClientAddToCart({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const cartProduct = {
    id: product.id,
    productId: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    imageUrl: product.thumbnail ?? "",
    category: product.category,
    isOffer: product.isOffer,
    discountPercentage: product.discountPct ?? undefined,
  };

  return (
    <button
      className="btn-primary"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        fontSize: "1.1rem",
        width: "100%",
        justifyContent: "center",
        background: isAdded ? "var(--success)" : undefined,
        boxShadow: isAdded ? "0 0 22px rgba(34,197,94,0.5)" : undefined,
        animation: isAdded ? "btn-added-pop 0.38s cubic-bezier(0.34,1.56,0.64,1)" : undefined,
        transition: "background 0.3s ease, box-shadow 0.3s ease",
      }}
      onClick={() => {
        if (isAdded) return;
        addToCart(cartProduct);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1600);
      }}
    >
      {isAdded ? (
        <><Check size={22} /> ¡AGREGADO!</>
      ) : (
        <><ShoppingCart size={22} /> AGREGAR AL CARRITO</>
      )}
    </button>
  );
}
