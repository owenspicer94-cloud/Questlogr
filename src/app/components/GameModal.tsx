"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Game } from "../types";

interface GameModalProps {
  gameId: number | null;
  onClose: () => void;
}

export default function GameModal({ gameId, onClose }: GameModalProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [hitlist, setHitlist] = useState(false);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    if (!gameId) return;
    setGame(null);
    setLoading(true);
    setHitlist(false);
    setPlayed(false);
    fetch(`/api/games/${gameId}`)
      .then((r) => r.json())
      .then((data) => setGame(data))
      .finally(() => setLoading(false));
  }, [gameId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!gameId) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
          zIndex: 100,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(720px, 95vw)",
          maxHeight: "88vh",
          overflowY: "auto",
          background: "var(--bg-card)",
          border: "1px solid var(--border-hover)",
          borderRadius: "20px",
          zIndex: 101,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {loading && (
          <div
            style={{
              padding: "80px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "14px",
            }}
          >
            Loading…
          </div>
        )}

        {!loading && game && (
          <>
            {/* Hero image */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "260px",
                flexShrink: 0,
                background: "var(--bg-elevated)",
                borderRadius: "20px 20px 0 0",
                overflow: "hidden",
              }}
            >
              {game.background_image && (
                <Image
                  src={game.background_image_additional || game.background_image}
                  alt={game.name}
                  fill
                  sizes="720px"
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              )}
              {/* Gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to bottom, transparent 40%, var(--bg-card) 100%)",
                }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "var(--text-primary)",
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(8px)",
                }}
              >
                ✕
              </button>

              {/* Cover art overlay */}
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "24px",
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "104px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "2px solid rgba(255,255,255,0.15)",
                    position: "relative",
                    flexShrink: 0,
                    background: "var(--bg-elevated)",
                  }}
                >
                  {game.background_image && (
                    <Image
                      src={game.background_image}
                      alt={game.name}
                      fill
                      sizes="80px"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  )}
                </div>
                <div style={{ paddingBottom: "4px" }}>
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      color: "var(--text-primary)",
                      marginBottom: "4px",
                      textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                    }}
                  >
                    {game.name}
                  </h2>
                  {game.developers && game.developers.length > 0 && (
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                      }}
                    >
                      {game.developers.map((d) => d.name).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 24px 28px" }}>
              {/* Meta row */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                {game.released && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      background: "var(--bg-elevated)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    📅{" "}
                    {new Date(game.released + "T00:00:00").toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
                  </span>
                )}
                {game.playtime && game.playtime > 0 ? (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      background: "var(--bg-elevated)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    ⏱ ~{game.playtime}h avg playtime
                  </span>
                ) : null}
                {game.esrb_rating && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      background: "var(--bg-elevated)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    🔞 {game.esrb_rating.name}
                  </span>
                )}
                {game.metacritic && (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color:
                        game.metacritic >= 75
                          ? "#4ade80"
                          : game.metacritic >= 50
                          ? "#facc15"
                          : "#f87171",
                      background: "var(--bg-elevated)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    Metacritic {game.metacritic}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setHitlist((v) => !v)}
                  style={{
                    flex: 1,
                    minWidth: "140px",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border: `1px solid ${hitlist ? "var(--accent)" : "var(--border-hover)"}`,
                    background: hitlist ? "var(--accent-dim)" : "var(--bg-elevated)",
                    color: hitlist ? "var(--accent)" : "var(--text-primary)",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {hitlist ? "✓" : "+"} {hitlist ? "On your Hitlist" : "Add to Hitlist"}
                </button>
                <button
                  onClick={() => setPlayed((v) => !v)}
                  style={{
                    flex: 1,
                    minWidth: "140px",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border: `1px solid ${played ? "#4ade80" : "var(--border-hover)"}`,
                    background: played ? "rgba(74,222,128,0.1)" : "var(--bg-elevated)",
                    color: played ? "#4ade80" : "var(--text-primary)",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {played ? "✓ Played" : "🎮 Mark as Played"}
                </button>
                {game.website && (
                  <a
                    href={game.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "12px 20px",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      background: "transparent",
                      color: "var(--text-muted)",
                      fontSize: "14px",
                      fontWeight: 500,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    🔗 Website
                  </a>
                )}
              </div>

              {/* Description */}
              {game.description_raw && (
                <div>
                  <h3
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      marginBottom: "10px",
                    }}
                  >
                    About
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.7,
                      display: "-webkit-box",
                      WebkitLineClamp: 6,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {game.description_raw}
                  </p>
                </div>
              )}

              {/* Genres */}
              {game.genres?.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <h3
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      marginBottom: "10px",
                    }}
                  >
                    Genres
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {game.genres.map((g) => (
                      <span
                        key={g.id}
                        style={{
                          fontSize: "12px",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          background: "var(--bg-elevated)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
