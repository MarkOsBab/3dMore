import { getProducts } from "@/lib/actions";
import CatalogSection from "@/components/CatalogSection";
import { ArrowRight } from "lucide-react";

type Product = Awaited<ReturnType<typeof getProducts>>[number];

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
      <CatalogSection products={products} />
    </main>
  );
}
