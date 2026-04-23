export default function CatalogoLoading() {
  const cardStyle = {
    background: "var(--bg-card)",
    borderRadius: "var(--radius-xl)",
    overflow: "hidden" as const,
    border: "1px solid rgba(255,255,255,0.05)",
  };

  return (
    <main style={{ paddingTop: "6rem", paddingBottom: "4rem" }}>
      <div className="container">
        {/* Header skeleton */}
        <div style={{ marginBottom: "2.5rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div className="skeleton" style={{ height: 44, width: "55%", borderRadius: "var(--radius-md)" }} />
          <div className="skeleton" style={{ height: 18, width: "22%", borderRadius: "var(--radius-sm)" }} />
        </div>

        {/* Layout skeleton */}
        <div className="catalog-layout">
          {/* Sidebar skeleton */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[110, 90, 160].map((h, i) => (
              <div key={i} style={cardStyle}>
                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div className="skeleton" style={{ height: 12, width: "50%", borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: h - 40, borderRadius: "var(--radius-sm)" }} />
                </div>
              </div>
            ))}
          </aside>

          {/* Grid skeleton */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={cardStyle}>
                <div className="skeleton" style={{ width: "100%", aspectRatio: "4/3" }} />
                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  <div className="skeleton" style={{ height: 14, width: "40%", borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 20, width: "80%", borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 14, width: "55%", borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 38, borderRadius: "999px", marginTop: "0.5rem" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
