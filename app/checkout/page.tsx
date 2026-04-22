"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Truck, CreditCard, CheckCircle2, ChevronRight, ChevronLeft,
  Home, Package, MapPin, Phone, FileText, Info,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCart, getUnitPrice, type CartProduct } from "@/lib/CartContext";

type Step = 0 | 1 | 2;
type ShippingMethod = "HOME_MVD" | "AGENCY" | "PICKUP";

interface ShippingZone {
  id: string;
  name: string;
  cost: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, profile, loading, isProfileComplete, signInWithGoogle, refreshProfile } = useAuth();
  const { items, subtotal, total, promoCode, promoDiscount } = useCart();

  const [step, setStep] = useState<Step>(0);
  const [zones, setZones] = useState<ShippingZone[]>([]);

  // Step 1 — Perfil
  const [form, setForm] = useState({ firstName: "", lastName: "", documentId: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Step 2 — Envío
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("HOME_MVD");
  const [zoneId, setZoneId] = useState("");
  const [address, setAddress] = useState("");
  const [agency, setAgency] = useState("");
  const [notes, setNotes] = useState("");

  // Step 3 — Pago
  const [processingMP, setProcessingMP] = useState(false);

  // Cargar zonas activas
  useEffect(() => {
    fetch("/api/shipping/zones").then(async (r) => {
      if (r.ok) setZones(await r.json());
    });
  }, []);

  // Sincronizar form con profile cuando cargue
  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        documentId: profile.documentId ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile]);

  // Redirigir al home si el carrito está vacío
  useEffect(() => {
    if (!loading && items.length === 0) {
      router.push("/");
    }
  }, [loading, items.length, router]);

  // Auto-avanzar al step 1 si ya está todo OK en step 0
  useEffect(() => {
    if (user && isProfileComplete && step === 0) {
      setStep(1);
    }
  }, [user, isProfileComplete, step]);

  // Cálculo de envío
  const selectedZone = zones.find((z) => z.id === zoneId);
  const shippingCost =
    shippingMethod === "HOME_MVD" ? (selectedZone?.cost ?? 0) :
    shippingMethod === "AGENCY"   ? 0 : // Coordinar, pago al retiro por agencia
    0;

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Error al guardar");
        return;
      }
      await refreshProfile();
      setStep(1);
    } finally {
      setSavingProfile(false);
    }
  };

  const canProceedFromShipping = () => {
    if (shippingMethod === "HOME_MVD") return Boolean(zoneId && address.trim());
    if (shippingMethod === "AGENCY") return Boolean(agency.trim());
    return true; // PICKUP
  };

  const payWithMP = async () => {
    setProcessingMP(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          promoCode,
          promoDiscount,
          shippingMethod,
          shippingCost,
          shippingData: {
            zoneId: shippingMethod === "HOME_MVD" ? zoneId : undefined,
            zoneName: selectedZone?.name,
            address: shippingMethod === "HOME_MVD" ? address : undefined,
            agency: shippingMethod === "AGENCY" ? agency : undefined,
            notes: notes || undefined,
          },
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Error al generar el pago.");
        setProcessingMP(false);
      }
    } catch {
      alert("Error de conexión.");
      setProcessingMP(false);
    }
  };

  const payWithWhatsApp = () => {
    // TextDecoder + Uint8Array son APIs de runtime — imposible de optimizar en build time
    const e = (bytes: number[]) => new TextDecoder().decode(new Uint8Array(bytes));
    const E = {
      tag:    e([0xF0,0x9F,0x8F,0xB7]), // 🏷
      money:  e([0xF0,0x9F,0x92,0xB0]), // 💰
      house:  e([0xF0,0x9F,0x8F,0xA0]), // 🏠
      box:    e([0xF0,0x9F,0x93,0xA6]), // 📦
      store:  e([0xF0,0x9F,0x8F,0xAA]), // 🏪
      memo:   e([0xF0,0x9F,0x93,0x9D]), // 📝
      person: e([0xF0,0x9F,0x91,0xA4]), // 👤
      mobile: e([0xF0,0x9F,0x93,0xB1]), // 📱
    };

    const orderText = items
      .map((item) => `\u2022 ${item.quantity}x ${item.name}${item.variantColorName ? ` (${item.variantColorName})` : ""} \u2014 $${(getUnitPrice(item) * item.quantity).toFixed(0)}`)
      .join("\n");

    const shippingText =
      shippingMethod === "HOME_MVD"
        ? `${E.house} Env\u00edo a domicilio \u2014 ${selectedZone?.name}: ${address} ($${shippingCost} efectivo/transferencia al entregar)`
        : shippingMethod === "AGENCY"
        ? `${E.box} Env\u00edo por agencia DAC \u2014 ${agency} (pago al retirar)`
        : `${E.store} Retiro en domicilio del vendedor (a coordinar)`;

    const lines: string[] = [
      "\u00a1Hola 3DMORE! Quiero hacer un pedido:",
      "",
      orderText,
      "",
    ];
    if (promoCode) lines.push(`${E.tag} C\u00f3digo: ${promoCode} (-${promoDiscount}%)`);
    lines.push(`${E.money} Total productos: $${total.toFixed(0)} UYU`);
    lines.push("");
    lines.push(shippingText);
    if (notes) lines.push(`${E.memo} ${notes}`);
    lines.push("");
    lines.push(`${E.person} ${form.firstName} ${form.lastName}`);
    lines.push(`${E.mobile} ${form.phone}  |  CI: ${form.documentId}`);

    const msg = lines.join("\n");
    const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading || items.length === 0) {
    return (
      <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </main>
    );
  }

  return (
    <main style={{ minHeight: "85vh", padding: "3rem 0" }}>
      <div className="container" style={{ maxWidth: 960 }}>
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/" style={{ color: "var(--text-secondary)", fontSize: "0.88rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ChevronLeft size={15} /> Seguir comprando
          </Link>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginTop: 8 }}>
            Finalizar <span className="text-gradient">compra</span>
          </h1>
        </div>

        <Stepper current={step} />

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: "2rem", marginTop: "2rem" }}>
          {/* Contenido del step */}
          <div className="glass animate-fade-in-up" style={{ padding: "2rem", borderRadius: "var(--radius-xl)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {step === 0 && (
              <StepProfile
                user={user}
                profile={profile}
                form={form}
                setForm={setForm}
                signIn={signInWithGoogle}
                onSave={saveProfile}
                saving={savingProfile}
              />
            )}
            {step === 1 && (
              <StepShipping
                zones={zones}
                method={shippingMethod} setMethod={setShippingMethod}
                zoneId={zoneId} setZoneId={setZoneId}
                address={address} setAddress={setAddress}
                agency={agency} setAgency={setAgency}
                notes={notes} setNotes={setNotes}
              />
            )}
            {step === 2 && (
              <StepReview
                items={items}
                subtotal={subtotal}
                total={total}
                promoCode={promoCode}
                promoDiscount={promoDiscount}
                method={shippingMethod}
                shippingCost={shippingCost}
                zoneName={selectedZone?.name}
                address={address}
                agency={agency}
                notes={notes}
                form={form}
                onMP={payWithMP}
                onWhatsApp={payWithWhatsApp}
                processingMP={processingMP}
              />
            )}

            {/* Footer de navegación */}
            {step > 0 && step < 2 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <button
                  onClick={() => setStep((step - 1) as Step)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.7rem 1.2rem", background: "transparent", color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-pill)", cursor: "pointer" }}
                >
                  <ChevronLeft size={16} /> Atrás
                </button>
                <button
                  onClick={() => setStep((step + 1) as Step)}
                  disabled={step === 1 && !canProceedFromShipping()}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "0.75rem 1.3rem", background: "var(--accent-pink)",
                    color: "white", border: "none", borderRadius: "var(--radius-pill)",
                    cursor: "pointer", fontWeight: 600,
                    opacity: step === 1 && !canProceedFromShipping() ? 0.4 : 1,
                  }}
                >
                  Continuar <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          <OrderSummary items={items} subtotal={subtotal} total={total} promoCode={promoCode} promoDiscount={promoDiscount} shippingCost={shippingCost} method={shippingMethod} />
        </div>
      </div>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────── STEPPER
function Stepper({ current }: { current: Step }) {
  const steps = [
    { label: "Perfil", icon: User },
    { label: "Envío", icon: Truck },
    { label: "Pago", icon: CreditCard },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = done ? CheckCircle2 : s.icon;
        return (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "0.55rem 1rem", borderRadius: "var(--radius-pill)",
              background: active ? "rgba(255,42,133,0.12)" : done ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${active ? "rgba(255,42,133,0.5)" : done ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.06)"}`,
              color: active ? "var(--accent-pink)" : done ? "var(--success)" : "var(--text-secondary)",
              fontSize: "0.88rem", fontWeight: active ? 700 : 500,
              transition: "all 0.25s",
            }}>
              <Icon size={15} />
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 30, height: 1, background: done ? "var(--success)" : "rgba(255,255,255,0.08)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────── STEP 1 — PROFILE
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StepProfile({ user, profile, form, setForm, signIn, onSave, saving }: any) {
  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
        <div style={{ width: 56, height: 56, margin: "0 auto 1rem", borderRadius: "50%", background: "rgba(255,42,133,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <User size={26} color="var(--accent-pink)" />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Iniciá sesión para continuar</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: 6, fontSize: "0.95rem" }}>
          Creá una cuenta con Google. Con ella podrás obtener descuentos exclusivos en tus próximas compras.
        </p>
        <button
          onClick={signIn}
          style={{
            marginTop: "1.5rem", display: "inline-flex", alignItems: "center", gap: 10,
            padding: "0.85rem 1.4rem", background: "white", color: "#222",
            borderRadius: "var(--radius-pill)", border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: "0.95rem",
          }}
        >
          <GoogleIcon /> Continuar con Google
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: 4 }}>Tus datos</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
        {profile?.firstName ? "Revisá y completá tus datos." : "Necesitamos estos datos para preparar tu pedido."}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
        <Field label="Nombre" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
        <Field label="Apellido" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
        <Field label="Documento (CI)" value={form.documentId} onChange={(v) => setForm({ ...form, documentId: v })} icon={FileText} />
        <Field label="Teléfono" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} icon={Phone} placeholder="+598…" />
      </div>

      <button
        onClick={onSave}
        disabled={saving || !form.firstName || !form.lastName || !form.documentId || !form.phone}
        style={{
          marginTop: "1.5rem", width: "100%", padding: "0.85rem",
          background: "var(--accent-pink)", color: "white", border: "none",
          borderRadius: "var(--radius-pill)", cursor: "pointer", fontWeight: 600,
          opacity: saving || !form.firstName || !form.lastName || !form.documentId || !form.phone ? 0.5 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        {saving ? "Guardando…" : <>Continuar al envío <ChevronRight size={16} /></>}
      </button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────── STEP 2 — SHIPPING
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StepShipping({ zones, method, setMethod, zoneId, setZoneId, address, setAddress, agency, setAgency, notes, setNotes }: any) {
  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: 4 }}>¿Cómo querés recibir tu pedido?</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
        El costo de envío se paga al momento de la entrega (efectivo o transferencia).
      </p>

      <div style={{ display: "grid", gap: "0.6rem", marginBottom: "1.5rem" }}>
        <MethodCard
          active={method === "HOME_MVD"} onClick={() => setMethod("HOME_MVD")}
          icon={Home} title="Envío a domicilio (Montevideo)"
          subtitle="Elegí tu zona — costo fijo"
        />
        <MethodCard
          active={method === "AGENCY"} onClick={() => setMethod("AGENCY")}
          icon={Package} title="Envío por agencia (DAC)"
          subtitle="Interior del país — pago al retiro en agencia"
        />
        <MethodCard
          active={method === "PICKUP"} onClick={() => setMethod("PICKUP")}
          icon={MapPin} title="Retiro en domicilio"
          subtitle="A coordinar con el vendedor por WhatsApp"
        />
      </div>

      {method === "HOME_MVD" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div>
            <label style={labelStyle}>Zona</label>
            <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="admin-input">
              <option value="">Seleccioná una zona</option>
              {zones.map((z: ShippingZone) => (
                <option key={z.id} value={z.id}>
                  {z.name} — ${z.cost}
                </option>
              ))}
            </select>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <Info size={12} /> Si tu zona no aparece, usá envío por agencia o retiro.
            </p>
          </div>
          <Field label="Dirección completa" value={address} onChange={setAddress} placeholder="Calle, número, apto" />
        </div>
      )}

      {method === "AGENCY" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <Field label="Agencia DAC" value={agency} onChange={setAgency} placeholder="Ej: DAC Colonia centro" />
          <div style={{ padding: "0.85rem", background: "rgba(59,130,246,0.08)", borderRadius: "var(--radius-md)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <p style={{ fontSize: "0.82rem", color: "var(--accent-blue)" }}>
              El envío por DAC se paga al retirar el paquete en la agencia de destino.
            </p>
          </div>
        </div>
      )}

      {method === "PICKUP" && (
        <div style={{ padding: "1rem", background: "rgba(34,197,94,0.08)", borderRadius: "var(--radius-md)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <p style={{ fontSize: "0.88rem", color: "var(--success)" }}>
            Al finalizar, te contactaremos por WhatsApp para coordinar día y horario de retiro.
          </p>
        </div>
      )}

      <div style={{ marginTop: "1rem" }}>
        <label style={labelStyle}>Notas (opcional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="admin-input"
          placeholder="Referencias, instrucciones de entrega…"
          style={{ resize: "vertical" }}
        />
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────── STEP 3 — REVIEW
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StepReview({ items, subtotal, total, promoCode, promoDiscount, method, shippingCost, zoneName, address, agency, notes, form, onMP, onWhatsApp, processingMP }: any) {
  const shippingLabel =
    method === "HOME_MVD" ? `Domicilio — ${zoneName} ($${shippingCost})` :
    method === "AGENCY"   ? `Agencia DAC — ${agency}` :
                            "Retiro en domicilio";

  return (
    <div>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "1.25rem" }}>Revisá y pagá</h2>

      <ReviewBlock title="Tus datos">
        <p style={{ fontSize: "0.9rem" }}>{form.firstName} {form.lastName}</p>
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>CI {form.documentId} · {form.phone}</p>
      </ReviewBlock>

      <ReviewBlock title="Envío">
        <p style={{ fontSize: "0.9rem" }}>{shippingLabel}</p>
        {address && <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{address}</p>}
        {notes && <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 4 }}>📝 {notes}</p>}
        {method !== "PICKUP" && (
          <p style={{ fontSize: "0.75rem", color: "var(--warning, #f59e0b)", marginTop: 6, display: "flex", gap: 4, alignItems: "center" }}>
            <Info size={12} /> El envío se abona al recibir (efectivo o transferencia).
          </p>
        )}
      </ReviewBlock>

      <ReviewBlock title="Productos">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {items.map((item: CartProduct & { quantity: number }) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
              <span>{item.quantity}× {item.name}{item.variantColorName ? ` (${item.variantColorName})` : ""}</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>${(getUnitPrice(item) * item.quantity).toFixed(0)}</span>
            </div>
          ))}
          {promoCode && (
            <p style={{ fontSize: "0.8rem", color: "var(--success)", marginTop: 4 }}>
              🏷 {promoCode} aplicado (-{promoDiscount}%)
            </p>
          )}
        </div>
      </ReviewBlock>

      <div style={{ padding: "1rem 0", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "0.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
          <span>Subtotal productos</span>
          <span>${subtotal.toFixed(0)}</span>
        </div>
        {promoDiscount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "var(--success)", marginTop: 4 }}>
            <span>Descuento</span>
            <span>-${(subtotal - total).toFixed(0)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 700, marginTop: 8 }}>
          <span>Total a pagar ahora</span>
          <span className="text-gradient">${total.toFixed(0)} UYU</span>
        </div>
        {method !== "PICKUP" && shippingCost > 0 && (
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4, textAlign: "right" }}>
            + ${shippingCost} de envío al recibir
          </p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", marginTop: "1rem" }}>
        <button
          onClick={onMP}
          disabled={processingMP}
          style={{
            padding: "0.95rem", background: "var(--accent-blue)", color: "white",
            border: "none", borderRadius: "var(--radius-pill)", cursor: "pointer",
            fontWeight: 700, fontSize: "0.95rem", display: "flex",
            alignItems: "center", justifyContent: "center", gap: 8,
            opacity: processingMP ? 0.7 : 1,
          }}
        >
          {processingMP ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Procesando…</> : <>💳 Pagar con Mercado Pago</>}
        </button>
        <button
          onClick={onWhatsApp}
          style={{
            padding: "0.95rem", background: "transparent",
            color: "var(--whatsapp)", border: "2px solid var(--whatsapp)",
            borderRadius: "var(--radius-pill)", cursor: "pointer",
            fontWeight: 700, fontSize: "0.95rem",
          }}
        >
          💬 Confirmar por WhatsApp
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────── SUMMARY LATERAL
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OrderSummary({ items, subtotal, total, promoCode, promoDiscount, shippingCost, method }: any) {
  return (
    <aside
      className="glass"
      style={{
        padding: "1.5rem", borderRadius: "var(--radius-xl)",
        border: "1px solid rgba(255,255,255,0.06)",
        position: "sticky", top: "1.5rem", height: "fit-content",
      }}
    >
      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>Tu pedido</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem", maxHeight: 260, overflowY: "auto" }}>
        {items.map((item: CartProduct & { quantity: number }) => (
          <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {item.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt="" style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", objectFit: "cover" }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                {item.quantity} × ${getUnitPrice(item).toFixed(0)}
                {item.variantColorName ? ` · ${item.variantColorName}` : ""}
              </p>
            </div>
            <span style={{ fontSize: "0.82rem", fontFamily: "var(--font-mono)" }}>${(getUnitPrice(item) * item.quantity).toFixed(0)}</span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: 4, fontSize: "0.85rem" }}>
        <Row label="Subtotal" value={`$${subtotal.toFixed(0)}`} muted />
        {promoDiscount > 0 && <Row label={`Descuento (${promoDiscount}%)`} value={`-$${(subtotal - total).toFixed(0)}`} color="var(--success)" />}
        {method === "HOME_MVD" && shippingCost > 0 && (
          <Row label="Envío (a pagar al recibir)" value={`$${shippingCost}`} color="var(--warning, #f59e0b)" />
        )}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontWeight: 700, fontSize: "1rem" }}>
          <span>Total online</span>
          <span className="text-gradient">${total.toFixed(0)}</span>
        </div>
        {promoCode && (
          <p style={{ fontSize: "0.72rem", color: "var(--success)", fontFamily: "var(--font-mono)" }}>🏷 {promoCode}</p>
        )}
      </div>
    </aside>
  );
}

// ───────────────────────────────────────────────────────────────── Pequeños helpers UI
const labelStyle: React.CSSProperties = {
  fontSize: "0.72rem", fontWeight: 600, letterSpacing: "1px",
  color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4, display: "block",
};

function Field({ label, value, onChange, icon: Icon, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ElementType;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        {Icon && (
          <Icon size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="admin-input"
          style={{ paddingLeft: Icon ? 34 : undefined }}
        />
      </div>
    </div>
  );
}

function MethodCard({ active, onClick, icon: Icon, title, subtitle }: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left", padding: "1rem",
        borderRadius: "var(--radius-lg)",
        background: active ? "rgba(255,42,133,0.08)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? "rgba(255,42,133,0.5)" : "rgba(255,255,255,0.08)"}`,
        cursor: "pointer", transition: "all 0.2s",
        display: "flex", alignItems: "center", gap: "1rem",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: "var(--radius-md)",
        background: active ? "rgba(255,42,133,0.15)" : "rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: active ? "var(--accent-pink)" : "var(--text-secondary)",
        flexShrink: 0,
      }}>
        <Icon size={18} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: "0.92rem" }}>{title}</p>
        <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 2 }}>{subtitle}</p>
      </div>
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        border: `2px solid ${active ? "var(--accent-pink)" : "rgba(255,255,255,0.15)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {active && <div style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--accent-pink)" }} />}
      </div>
    </button>
  );
}

function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1rem", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <p style={{ ...labelStyle, marginBottom: 6 }}>{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value, muted, color }: { label: string; value: string; muted?: boolean; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", color: color ?? (muted ? "var(--text-secondary)" : undefined) }}>
      <span>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)" }}>{value}</span>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.17v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC04" d="M5.85 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.17a11 11 0 0 0 0 9.9l3.68-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.08 14.97 1 12 1A11 11 0 0 0 2.17 7.05l3.68 2.84C6.71 7.29 9.14 5.38 12 5.38z" />
    </svg>
  );
}

