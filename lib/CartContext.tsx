"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface CartProduct {
  id: string;             // unique cart key: productId or productId_variantId
  productId: string;      // actual product ID
  name: string;
  description: string;
  price: number;          // base price before discount
  imageUrl: string;
  category: string;
  variantId?: string;
  variantColorName?: string;
  isOffer?: boolean;
  discountPercentage?: number;
}

interface CartItem extends CartProduct {
  quantity: number;
}

interface CartContextProps {
  items: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (val: boolean) => void;
  subtotal: number;
  total: number;
  promoCode: string;
  promoDiscount: number;
  applyPromo: (code: string) => Promise<{ valid: boolean; message: string }>;
  removePromo: () => void;
  lastAdded: CartProduct | null;
}

const CartContext = createContext<CartContextProps>({} as CartContextProps);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [lastAdded, setLastAdded] = useState<CartProduct | null>(null);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("3dmore_cart");
      if (savedCart) setItems(JSON.parse(savedCart));
      const savedPromo = localStorage.getItem("3dmore_promo");
      if (savedPromo) {
        const { code, discount } = JSON.parse(savedPromo);
        setPromoCode(code);
        setPromoDiscount(discount);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("3dmore_cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (promoCode) {
      localStorage.setItem("3dmore_promo", JSON.stringify({ code: promoCode, discount: promoDiscount }));
    } else {
      localStorage.removeItem("3dmore_promo");
    }
  }, [promoCode, promoDiscount]);

  const addToCart = (product: CartProduct) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setLastAdded(product);
  };
2
  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    removePromo();
  };

  const unitPrice = (item: CartItem) =>
    item.isOffer && item.discountPercentage
      ? item.price * (1 - item.discountPercentage / 100)
      : item.price;

  const subtotal = items.reduce((acc, item) => acc + unitPrice(item) * item.quantity, 0);

  const total = promoDiscount > 0
    ? subtotal * (1 - promoDiscount / 100)
    : subtotal;

  const applyPromo = async (code: string): Promise<{ valid: boolean; message: string }> => {
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoCode(code.toUpperCase());
        setPromoDiscount(data.discountPct);
        return { valid: true, message: `¡Código aplicado! ${data.discountPct}% de descuento.` };
      }
      return { valid: false, message: "Código inválido, expirado o sin usos disponibles." };
    } catch {
      return { valid: false, message: "Error al validar el código." };
    }
  };

  const removePromo = () => {
    setPromoCode("");
    setPromoDiscount(0);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isCartOpen, setIsCartOpen, subtotal, total, promoCode, promoDiscount, applyPromo, removePromo, lastAdded }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

export function getUnitPrice(item: CartProduct): number {
  return item.isOffer && item.discountPercentage
    ? item.price * (1 - item.discountPercentage / 100)
    : item.price;
}
