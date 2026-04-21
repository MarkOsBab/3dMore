export default function AdminProductsLoading() {
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
        <div className="skeleton" style={{ height: 36, width: 200 }} />
        <div className="skeleton" style={{ height: 44, width: 160, borderRadius: "999px" }} />
      </div>

      {/* Table skeleton */}
      <div
        className="glass"
        style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 1fr 100px 100px 120px",
            gap: "1rem",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 14 }} />
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 1fr 100px 100px 120px",
              gap: "1rem",
              padding: "1rem 1.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div className="skeleton" style={{ height: 42, borderRadius: "var(--radius-sm)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", justifyContent: "center" }}>
              <div className="skeleton" style={{ height: 14, width: "80%" }} />
              <div className="skeleton" style={{ height: 12, width: "55%" }} />
            </div>
            <div className="skeleton" style={{ height: 14, alignSelf: "center" }} />
            <div className="skeleton" style={{ height: 14, alignSelf: "center" }} />
            <div className="skeleton" style={{ height: 22, width: 60, borderRadius: "999px", alignSelf: "center" }} />
            <div style={{ display: "flex", gap: "0.5rem", alignSelf: "center" }}>
              <div className="skeleton" style={{ height: 32, width: 56, borderRadius: "var(--radius-sm)" }} />
              <div className="skeleton" style={{ height: 32, width: 56, borderRadius: "var(--radius-sm)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
