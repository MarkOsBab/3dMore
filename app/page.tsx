import { getProducts } from "@/lib/actions";
import ProductCard from "@/components/ProductCard";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();

  return (
    <main>
      {/* Hero Section */}
      <section
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          paddingTop: "4rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow blobs */}
        <div style={{ position: "absolute", top: "20%", left: "-10%", width: "40vw", height: "40vw", background: "var(--glow-pink)", filter: "blur(100px)", borderRadius: "50%", zIndex: -1 }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "30vw", height: "30vw", background: "var(--glow-blue)", filter: "blur(100px)", borderRadius: "50%", zIndex: -1 }} />

        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", alignItems: "center" }}>
          <div className="animate-fade-in-up">
            <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1.1, marginBottom: "1rem", fontWeight: 800 }}>
              PERSONALIZA TU <br />
              <span className="text-gradient">RODADA</span>
            </h1>
            <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: "500px" }}>
              Accesorios impresos en 3D para cascos. Orejitas, cuernos de demonio y más. Expresa tu estilo en el asfalto.
            </p>
            <a href="#products" className="btn-primary" style={{ display: "inline-block", padding: "1rem 2rem" }}>
              Ver Catálogo
            </a>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {products[0]?.thumbnail ? (
              <div className="glass" style={{ width: "100%", aspectRatio: "1/1", borderRadius: "24px", padding: "1rem", background: "linear-gradient(145deg,rgba(21,21,32,.8),rgba(10,10,15,.8))" }}>
                <img src={products[0].thumbnail} alt={products[0].name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "16px" }} />
              </div>
            ) : (
              <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: "24px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                <span style={{ fontSize: "5rem" }}>🪖</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="products" style={{ padding: "6rem 0", backgroundColor: "rgba(0,0,0,0.3)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
            <div>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                NUESTROS <span className="text-gradient">PRODUCTOS</span>
              </h2>
              <p style={{ color: "var(--text-secondary)" }}>Diseños únicos para destacar en cada viaje.</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
              <p style={{ fontSize: "1.2rem" }}>🚧 Cargando productos desde la base de datos...</p>
              <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>Si ves esto, la BD no está conectada aún. Agrega productos desde <a href="/admin/products" style={{ color: "var(--accent-pink)" }}>/admin</a>.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
              {products.map((product, index) => (
                <div key={product.id} style={{ animationDelay: `${0.1 * index}s` }} className="animate-fade-in-up">
                  <ProductCard product={product as any} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
