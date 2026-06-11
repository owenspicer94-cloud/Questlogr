import Header from "../components/Header";
import Timeline from "../components/Timeline";

export default function ReleasesPage() {
  return (
    <main style={{ minHeight: "100vh" }}>
      <Header />
      <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "40px 40px 16px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            marginBottom: "4px",
          }}
        >
          Releases
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "0" }}>
          Upcoming game releases across all platforms
        </p>
      </div>
      <Timeline />
    </main>
  );
}
