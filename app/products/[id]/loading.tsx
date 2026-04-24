export default function ProductLoading() {
  return (
    <main className="container" style={{ padding: "6rem 1.5rem" }}>
      {/* Back link skeleton */}
      <div className="skeleton" style={{ height: 20, width: 160, marginBottom: "2rem" }} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
          gap: "4rem",
          alignItems: "start",
        }}
      >
        {/* Image skeleton */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="skeleton" style={{ width: "100%", aspectRatio: "1/1", borderRadius: "var(--radius-xl)" }} />
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ width: 70, height: 70, borderRadius: "var(--radius-md)" }} />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="skeleton" style={{ height: 18, width: 100 }} />
          <div className="skeleton" style={{ height: 48, width: "85%" }} />
          <div className="skeleton" style={{ height: 36, width: 120 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div className="skeleton" style={{ height: 16, width: "100%" }} />
            <div className="skeleton" style={{ height: 16, width: "90%" }} />
            <div className="skeleton" style={{ height: 16, width: "70%" }} />
          </div>
          {/* Variants */}
          <div>
            <div className="skeleton" style={{ height: 16, width: 80, marginBottom: "0.75rem" }} />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ width: 44, height: 44, borderRadius: "50%" }} />
              ))}
            </div>
          </div>
          <div className="skeleton" style={{ height: 54, borderRadius: "999px", marginTop: "0.5rem" }} />
        </div>
      </div>
    </main>
  );
}
