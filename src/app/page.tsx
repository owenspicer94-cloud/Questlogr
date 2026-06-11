"use client";

import Header from "./components/Header";
import Link from "next/link";

const FEATURES = [
  {
    icon: "📅",
    title: "Release Calendar",
    desc: "Never miss a launch. Track upcoming games across every platform in one place.",
    href: "/releases",
    cta: "Browse Releases",
  },
  {
    icon: "⭐",
    title: "Reviews",
    desc: "Rate and review the games you've played. Build your personal gaming diary.",
    href: "/reviews",
    cta: "See Reviews",
  },
  {
    icon: "🎮",
    title: "Gamers",
    desc: "Find and follow other players. Discover games through the people you trust.",
    href: "/gamers",
    cta: "Find Gamers",
  },
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Header />

      {/* Hero */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "100px 24px 120px",
          textAlign: "center",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "500px",
            background:
              "radial-gradient(ellipse at center, rgba(124, 106, 247, 0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "9999px",
            border: "1px solid rgba(124,106,247,0.3)",
            background: "rgba(124,106,247,0.08)",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--accent)",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--accent)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Now in beta
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(42px, 7vw, 80px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: "var(--text-primary)",
            marginBottom: "24px",
            maxWidth: "800px",
            margin: "0 auto 24px",
          }}
        >
          Your gaming life,
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #7c6af7 0%, #a78bfa 50%, #c4b5fd 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            logged.
          </span>
        </h1>

        {/* Subheading */}
        <p
          style={{
            fontSize: "18px",
            color: "var(--text-secondary)",
            maxWidth: "520px",
            margin: "0 auto 48px",
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          Track every game you play, review your favourites, discover what others
          are playing, and never miss a release again.
        </p>

        {/* CTA buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/login"
            style={{
              padding: "14px 32px",
              borderRadius: "12px",
              background: "var(--accent)",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 700,
              textDecoration: "none",
              transition: "opacity 0.15s, transform 0.15s",
              display: "inline-block",
            }}
          >
            Get Started — it&apos;s free
          </Link>
          <Link
            href="/releases"
            style={{
              padding: "14px 32px",
              borderRadius: "12px",
              border: "1px solid var(--border-hover)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Browse Releases
          </Link>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px 120px",
        }}
      >
        {/* Section label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Everything you need
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        </div>

        {/* Feature cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  padding: "32px",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  background: "var(--bg-card)",
                  height: "100%",
                  transition: "border-color 0.15s, background 0.15s, transform 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "rgba(124,106,247,0.4)";
                  el.style.background = "var(--bg-elevated)";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "var(--border)";
                  el.style.background = "var(--bg-card)";
                  el.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "var(--accent-dim)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    marginBottom: "20px",
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: "10px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                    marginBottom: "24px",
                  }}
                >
                  {f.desc}
                </p>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--accent)",
                  }}
                >
                  {f.cta} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          © 2026 Questlogr · Built for gamers
        </span>
      </footer>
    </main>
  );
}
