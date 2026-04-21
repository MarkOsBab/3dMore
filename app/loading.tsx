export default function HomeLoading() {
  return (
    <main>
      {/* Hero skeleton */}
      <section
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          paddingTop: "4rem",
        }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="skeleton" style={{ height: 60, width: "80%" }} />
            <div className="skeleton" style={{ height: 60, width: "60%" }} />
            <div className="skeleton" style={{ height: 20, width: "90%", marginTop: "0.5rem" }} />
            <div className="skeleton" style={{ height: 20, width: "75%" }} />
            <div className="skeleton" style={{ height: 50, width: 180, borderRadius: "999px", marginTop: "1rem" }} />
          </div>
          <div className="skeleton" style={{ width: "100%", aspectRatio: "1/1", borderRadius: "24px" }} />
        </div>
      </section>

      {/* Catalog skeleton */}
      <section style={{ padding: "6rem 0", backgroundColor: "rgba(0,0,0,0.3)" }}>
        <div className="container">
          <div style={{ marginBottom: "3rem" }}>
            <div className="skeleton" style={{ height: 44, width: 260, marginBottom: "0.75rem" }} />
            <div className="skeleton" style={{ height: 20, width: 340 }} />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "2rem",
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="glass"
                style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}
              >
                <div className="skeleton" style={{ height: 250, borderRadius: 0 }} />
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div className="skeleton" style={{ height: 20, width: "70%" }} />
                  <div className="skeleton" style={{ height: 16, width: "90%" }} />
                  <div className="skeleton" style={{ height: 16, width: "60%" }} />
                  <div className="skeleton" style={{ height: 44, borderRadius: "999px", marginTop: "0.5rem" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
