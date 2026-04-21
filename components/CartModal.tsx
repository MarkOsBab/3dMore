"use client";

import { useCart, getUnitPrice } from "@/lib/CartContext";
import { X, Trash2, Tag, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function CartModal() {
  const {
    items, isCartOpen, setIsCartOpen, removeFromCart,
    subtotal, total, promoCode, promoDiscount, applyPromo, removePromo,
  } = useCart();

  const [codeInput, setCodeInput] = useState("");
  const [promoMsg, setPromoMsg] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "ok" | "err">("idle");
  const [promoLoading, setPromoLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Mount/unmount with animation timing
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
      setShouldRender(true);
      // Double rAF to ensure DOM is painted before transition starts
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsVisible(true))
      );
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(t);
    }
  }, [isCartOpen]);

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
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, promoCode, promoDiscount }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Hubo un error al generar el pago.");
    } catch {
      alert("Hubo un error de conexión.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className="glass"
        style={{
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          backgroundColor: "var(--bg-dark)",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-drawer)",
          transform: isVisible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>TU CARRITO</h2>
          <button aria-label="Cerrar carrito" style={{ background: "none", color: "white" }} onClick={() => setIsCartOpen(false)}>
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
                    <img src={item.imageUrl} alt={item.name} style={{ width: 68, height: 68, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} />
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
                        <span style={{ marginLeft: "0.5rem", color: "var(--success)" }}>{item.discountPercentage}% OFF</span>
                      ) : null}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem", flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, color: "var(--accent-blue)" }}>
                      ${(unitPriceValue * item.quantity).toFixed(0)}
                    </span>
                    <button aria-label="Eliminar producto" style={{ color: "var(--accent-pink)", background: "none" }} onClick={() => removeFromCart(item.id)}>
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
                      style={{ flexGrow: 1, backgroundColor: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-sm)", padding: "0.6rem 0.9rem", color: "white", fontSize: "0.9rem", outline: "none", fontFamily: "var(--font-mono)" }}
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading}
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1rem", borderRadius: "var(--radius-sm)", background: "var(--surface-3)", border: "1px solid rgba(255,255,255,0.15)", color: "white", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}
                    >
                      <Tag size={16} /> {promoLoading ? "..." : "Aplicar"}
                    </button>
                  </div>
                  {promoMsg && (
                    <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem", color: promoStatus === "ok" ? "var(--success)" : "var(--danger)" }}>
                      {promoStatus === "ok" ? <CheckCircle size={14} /> : <XCircle size={14} />} {promoMsg}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.9rem", borderRadius: "var(--radius-sm)", background: "var(--success-soft)", border: "1px solid rgba(34,197,94,0.3)" }}>
                  <p style={{ color: "var(--success)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle size={16} /> <code style={{ fontFamily: "var(--font-mono)" }}>{promoCode}</code> — {promoDiscount}% OFF
                  </p>
                  <button aria-label="Quitar código" onClick={removePromo} style={{ background: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
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
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--success)", fontSize: "0.9rem" }}>
                    <span>Descuento ({promoDiscount}%)</span>
                    <span>-${(subtotal - total).toFixed(0)}</span>
                  </div>
                </>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.25rem", fontWeight: 700, marginTop: "0.25rem" }}>
                <span>Total</span>
                <span className="text-gradient">${total.toFixed(0)} UYU</span>
              </div>
            </div>

            {/* Checkout buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button onClick={handleCheckoutMP} disabled={checkoutLoading} className="btn-primary" style={{ width: "100%", background: "var(--accent-blue)", boxShadow: "var(--shadow-cta-blue)", opacity: checkoutLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                {checkoutLoading ? (
                  <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Procesando…</>
                ) : (
                  <>💳 PAGAR CON MERCADO PAGO</>
                )}
              </button>
              <button onClick={handleCheckoutWhatsApp} className="btn-primary" style={{ width: "100%", background: "transparent", border: "2px solid var(--whatsapp)", color: "var(--whatsapp)", boxShadow: "none" }}>
                💬 PAGAR POR WHATSAPP
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
