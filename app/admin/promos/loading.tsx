export default function AdminPromosLoading() {
  return (
    <div style={{ padding: "2rem" }}>
      {/* Toolbar skeleton */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div className="skeleton" style={{ height: 36, width: 220 }} />
        <div className="skeleton" style={{ height: 44, width: 160, borderRadius: "999px" }} />
      </div>

      {/* Cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="glass"
            style={{
              borderRadius: "var(--radius-xl)",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="skeleton" style={{ height: 28, width: 100, borderRadius: "var(--radius-sm)" }} />
              <div className="skeleton" style={{ height: 22, width: 60, borderRadius: "999px" }} />
            </div>
            <div className="skeleton" style={{ height: 14, width: "60%" }} />
            <div className="skeleton" style={{ height: 14, width: "80%" }} />
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
              <div className="skeleton" style={{ height: 32, flex: 1, borderRadius: "var(--radius-sm)" }} />
              <div className="skeleton" style={{ height: 32, width: 40, borderRadius: "var(--radius-sm)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
