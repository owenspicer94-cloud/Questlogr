import Header from "../components/Header";

export default function AccountPage() {
  return (
    <main style={{ minHeight: "100vh" }}>
      <Header />
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "var(--accent-dim)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            margin: "0 auto 24px",
          }}
        >
          👤
        </div>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          My Account
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "var(--text-secondary)",
            maxWidth: "400px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Your profile, game log, backlog, and wishlist will all live here.
          Coming soon.
        </p>
      </div>
    </main>
  );
}
