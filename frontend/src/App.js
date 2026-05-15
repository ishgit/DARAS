import { useEffect } from "react";
import "./App.css";

/**
 * /app/frontend (port 3000) is just a launcher that forwards to the Flask app
 * served by uvicorn on port 8001 at /api/  (kubernetes ingress routes /api/* → 8001).
 */
function App() {
  useEffect(() => {
    // Preserve path: /admin  → /api/admin/panel ;  everything else → /api/
    const p = window.location.pathname;
    if (p.startsWith("/admin")) {
      window.location.replace("/api/admin/panel");
    } else {
      window.location.replace("/api/");
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FBF7F2",
        fontFamily:
          "'Fraunces', 'Hind', 'Noto Sans Bengali', system-ui, serif",
        color: "#292524",
        flexDirection: "column",
        gap: "12px",
      }}
      data-testid="launcher-redirect"
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#B4532A",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 12,
            borderRadius: "50%",
            background: "#B45309",
          }}
        />
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
        दारस DARAS
      </div>
      <div style={{ fontSize: 14, color: "#57534E" }}>
        Opening your financial companion…
      </div>
    </div>
  );
}

export default App;
