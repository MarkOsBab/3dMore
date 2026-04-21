"use client";

import { useCart } from "@/lib/CartContext";
import { ShoppingCart } from "lucide-react";

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
      }}
      onClick={() => addToCart(cartProduct)}
    >
      <ShoppingCart size={22} />
      AGREGAR AL CARRITO
    </button>
  );
}
