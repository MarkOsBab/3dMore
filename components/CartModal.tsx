"use client";

import { useCart, getUnitPrice } from "@/lib/CartContext";
import { X, Trash2, Tag, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

export default function CartModal() {
  const {
    items, isCartOpen, setIsCartOpen, removeFromCart,
    subtotal, total, promoCode, promoDiscount, applyPromo, removePromo,
  } = useCart();

  const [codeInput, setCodeInput] = useState("");
  const [promoMsg, setPromoMsg] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "ok" | "err">("idle");
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!codeInput.trim()) return;
    setPromoLoading(true);
    const result = await applyPromo(codeInput.trim());
    setPromoMsg(result.message);
    setPromoStatus(result.valid ? "ok" : "err");
    setPromoLoading(false);
    if (result.valid) setCodeInput("");
  };

  const handleCheckoutWhatsApp = () => {
    const orderText = items
      .map((item) => `${item.quantity}x ${item.name}${item.variantColorName ? ` (${item.variantColorName})` : ""} — $${(getUnitPrice(item) * item.quantity).toFixed(0)} UYU`)
      .join("\n");
    const promoLine = promoCode ? `\nCódigo promo: ${promoCode} (-${promoDiscount}%)` : "";
    const message = `Hola 3DMORE! Me gustaría hacer un pedido:\n\n${orderText}${promoLine}\n\nTotal: $${total.toFixed(0)} UYU\n\nEspero instrucciones para el pago. ¡Gracias!`;
    window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleCheckoutMP = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, promoCode }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Hubo un error al generar el pago.");
    } catch {
      alert("Hubo un error de conexión.");
    }
  };

  if (!isCartOpen) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", justifyContent: "flex-end" }}
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className="glass"
        style={{ width: "100%", maxWidth: "460px", height: "100%", backgroundColor: "var(--bg-dark)", padding: "2rem", display: "flex", flexDirection: "column", boxShadow: "-10px 0 40px rgba(255,42,133,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>TU CARRITO</h2>
          <button style={{ background: "none", color: "white" }} onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.25rem", paddingRight: "0.25rem" }}>
          {items.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: "3rem" }}>Tu carrito está vacío.</p>
          ) : (
            items.map((item) => {
              const unitPriceValue = getUnitPrice(item);
              return (
                <div key={item.id} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} style={{ width: "68px", height: "68px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }} />
                  )}
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <h4 style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</h4>
                    {item.variantColorName && (
                      <p style={{ fontSize: "0.8rem", color: "var(--accent-pink)", marginBottom: "0.15rem" }}>
                        Color: {item.variantColorName}
                      </p>
                    )}
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      Cant: {item.quantity}
                      {item.isOffer && item.discountPercentage ? (
                        <span style={{ marginLeft: "0.5rem", color: "#22c55e" }}>{item.discountPercentage}% OFF</span>
                      ) : null}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem", flexShrink: 0 }}>
                    <span style={{ fontWeight: "bold", color: "var(--accent-blue)" }}>
                      ${(unitPriceValue * item.quantity).toFixed(0)}
                    </span>
                    <button style={{ color: "var(--accent-pink)", background: "none" }} onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div style={{ paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>

            {/* Promo code */}
            <div style={{ marginBottom: "1.5rem" }}>
              {!promoCode ? (
                <div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      value={codeInput}
                      onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setPromoStatus("idle"); }}
                      placeholder="Código de descuento"
                      style={{ flexGrow: 1, backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.6rem 0.9rem", color: "white", fontSize: "0.9rem", outline: "none" }}
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading}
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1rem", borderRadius: "8px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "white", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}
                    >
                      <Tag size={16} /> {promoLoading ? "..." : "Aplicar"}
                    </button>
                  </div>
                  {promoMsg && (
                    <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem", color: promoStatus === "ok" ? "#22c55e" : "#ef4444" }}>
                      {promoStatus === "ok" ? <CheckCircle size={14} /> : <XCircle size={14} />} {promoMsg}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.9rem", borderRadius: "8px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                  <p style={{ color: "#22c55e", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle size={16} /> <code>{promoCode}</code> — {promoDiscount}% OFF
                  </p>
                  <button onClick={removePromo} style={{ background: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {promoDiscount > 0 && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(0)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#22c55e", fontSize: "0.9rem" }}>
                    <span>Descuento ({promoDiscount}%)</span>
                    <span>-${(subtotal - total).toFixed(0)}</span>
                  </div>
                </>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.25rem", fontWeight: "bold", marginTop: "0.25rem" }}>
                <span>Total</span>
                <span className="text-gradient">${total.toFixed(0)} UYU</span>
              </div>
            </div>

            {/* Checkout buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button onClick={handleCheckoutMP} className="btn-primary" style={{ width: "100%", background: "var(--accent-blue)", boxShadow: "0 0 15px var(--glow-blue)" }}>
                💳 PAGAR CON MERCADO PAGO
              </button>
              <button onClick={handleCheckoutWhatsApp} className="btn-primary" style={{ width: "100%", background: "transparent", border: "2px solid #25D366", color: "#25D366", boxShadow: "none" }}>
                💬 PAGAR POR WHATSAPP
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
