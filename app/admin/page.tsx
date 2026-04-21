// Dashboard page
export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}>Dashboard</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        <div className="glass" style={{ padding: "2rem", borderRadius: "12px", borderLeft: "4px solid var(--accent-pink)" }}>
          <h3 style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Productos Activos</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>0</p>
        </div>
        
        <div className="glass" style={{ padding: "2rem", borderRadius: "12px", borderLeft: "4px solid var(--accent-blue)" }}>
          <h3 style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Códigos Promocionales</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>0</p>
        </div>
      </div>
      
      <div style={{ marginTop: "3rem", padding: "2rem", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Bienvenido a tu Administrador</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Desde aquí puedes manejar tu stock de 3dMore, subir fotos de variantes de colores y gestionar descuentos. 
          Recuerda no compartir tus credenciales de Basic Auth con nadie.
        </p>
      </div>
    </div>
  );
}
