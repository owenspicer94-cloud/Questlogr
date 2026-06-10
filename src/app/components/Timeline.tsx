"use client";

import { useState, useEffect, useCallback } from "react";
import { Game, RAWGResponse } from "../types";
import GameCard from "./GameCard";

const PLATFORMS = [
  { label: "All", value: "all" },
  { label: "PC", value: "4" },
  { label: "PS5", value: "187" },
  { label: "Xbox", value: "186" },
  { label: "Switch", value: "7" },
];

function groupByMonth(games: Game[]): Record<string, Game[]> {
  const groups: Record<string, Game[]> = {};
  for (const game of games) {
    if (!game.released) continue;
    const d = new Date(game.released + "T00:00:00");
    const key = d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(game);
  }
  return groups;
}

function isToday(dateStr: string) {
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}

export default function Timeline() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchGames = useCallback(
    async (selectedPlatform: string, pageNum: number, append = false) => {
      try {
        if (!append) setLoading(true);
        else setLoadingMore(true);

        const res = await fetch(
          `/api/games?platform=${selectedPlatform}&page=${pageNum}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data: RAWGResponse = await res.json();

        setGames((prev) =>
          append ? [...prev, ...data.results] : data.results
        );
        setHasMore(!!data.next);
      } catch {
        setError("Could not load games. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    setPage(1);
    fetchGames(platform, 1, false);
  }, [platform, fetchGames]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchGames(platform, nextPage, true);
  };

  const groups = groupByMonth(games);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>
      {/* Platform filter */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "40px",
          flexWrap: "wrap",
        }}
      >
        {PLATFORMS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPlatform(p.value)}
            style={{
              padding: "7px 16px",
              borderRadius: "9999px",
              border: `1px solid ${
                platform === p.value ? "var(--accent)" : "var(--border)"
              }`,
              background:
                platform === p.value ? "var(--accent-dim)" : "transparent",
              color:
                platform === p.value
                  ? "var(--accent)"
                  : "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: platform === p.value ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: "var(--font-geist-sans, sans-serif)",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: "96px",
                borderRadius: "10px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                opacity: 1 - i * 0.1,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 0.8; }
            }
          `}</style>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--text-muted)",
          }}
        >
          <p style={{ marginBottom: "12px" }}>{error}</p>
          <button
            onClick={() => fetchGames(platform, 1, false)}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Timeline */}
      {!loading && !error && (
        <>
          {Object.entries(groups).map(([month, monthGames]) => (
            <section key={month} style={{ marginBottom: "48px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {month}
                </h2>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "var(--border)",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                  }}
                >
                  {monthGames.length} release{monthGames.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {monthGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isToday={game.released ? isToday(game.released) : false}
                  />
                ))}
              </div>
            </section>
          ))}

          {games.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: "var(--text-muted)",
              }}
            >
              No upcoming releases found for this platform.
            </div>
          )}

          {hasMore && (
            <div style={{ textAlign: "center", paddingBottom: "40px" }}>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  padding: "10px 28px",
                  borderRadius: "9999px",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: loadingMore
                    ? "var(--text-muted)"
                    : "var(--text-secondary)",
                  fontSize: "13px",
                  cursor: loadingMore ? "default" : "pointer",
                  transition: "all 0.15s",
                  fontFamily: "var(--font-geist-sans, sans-serif)",
                }}
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
