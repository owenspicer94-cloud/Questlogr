export default function Header() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(13, 13, 20, 0.9)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>🎮</span>
          <span
            style={{
              fontWeight: 700,
              fontSize: "17px",
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            Drop
          </span>
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              marginLeft: "4px",
            }}
          >
            release calendar
          </span>
        </div>
      </div>
    </header>
  );
}
