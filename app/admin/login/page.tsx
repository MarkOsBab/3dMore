"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Error al iniciar sesión");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-dark)",
        padding: "1rem",
      }}
    >
      <div
        className="glass animate-fade-in-up"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "2.5rem",
          borderRadius: "var(--radius-xl)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: 52, height: 52,
              borderRadius: 14,
              background: "rgba(255,42,133,0.12)",
              border: "1px solid rgba(255,42,133,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <ShieldCheck size={24} color="var(--accent-pink)" />
          </div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 4 }}>
            Panel de <span className="text-gradient">administración</span>
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
            Acceso restringido — solo personal autorizado
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Usuario</label>
            <div style={{ position: "relative" }}>
              <User
                size={15}
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}
              />
              <input
                className="admin-input"
                type="text"
                autoComplete="username"
                placeholder="usuario"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                style={{ paddingLeft: "2.2rem", width: "100%" }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Contraseña</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={15}
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}
              />
              <input
                className="admin-input"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                style={{ paddingLeft: "2.2rem", paddingRight: "2.5rem", width: "100%" }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "var(--text-muted)", padding: 4,
                }}
                aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <p style={{
              fontSize: "0.82rem", color: "var(--danger)",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 8, padding: "0.6rem 0.9rem",
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              marginTop: "0.5rem", width: "100%", padding: "0.85rem",
              fontSize: "0.95rem", fontWeight: 700,
              opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Verificando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.72rem",
  fontWeight: 600,
  letterSpacing: "1px",
  textTransform: "uppercase",
  color: "var(--text-secondary)",
  marginBottom: 6,
};
