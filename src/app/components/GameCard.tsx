"use client";

import { Game } from "../types";

const PLATFORM_LABELS: Record<string, string> = {
  pc: "PC",
  playstation5: "PS5",
  playstation4: "PS4",
  "xbox-series-x": "Xbox",
  "xbox-one": "Xbox One",
  "nintendo-switch": "Switch",
  ios: "iOS",
  android: "Android",
  macos: "Mac",
  linux: "Linux",
};

const PLATFORM_COLORS: Record<string, string> = {
  pc: "#6b7280",
  playstation5: "#003db5",
  playstation4: "#003db5",
  "xbox-series-x": "#107c10",
  "xbox-one": "#107c10",
  "nintendo-switch": "#e4000f",
  ios: "#6b7280",
  android: "#3ddc84",
  macos: "#6b7280",
  linux: "#6b7280",
};

function getTopPlatforms(platforms: Game["platforms"]) {
  if (!platforms) return [];
  const priority = ["playstation5", "xbox-series-x", "pc", "nintendo-switch", "playstation4", "xbox-one", "ios", "android"];
  return [...platforms]
    .sort((a, b) => {
      const ai = priority.indexOf(a.platform.slug);
      const bi = priority.indexOf(b.platform.slug);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .slice(0, 4);
}

function formatDay(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const HYPE_MAX = 100_000;
function getHype(added?: number) {
  if (!added) return 0;
  return Math.min(100, Math.round((added / HYPE_MAX) * 100));
}

interface GameCardProps {
  game: Game;
  isToday?: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
}

export default function GameCard({ game, isToday, isExpanded, onClick }: GameCardProps) {
  const platforms = getTopPlatforms(game.platforms);
  const hype = getHype(game.added);

  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "stretch",
        minHeight: "160px",
        background: isExpanded ? "var(--bg-elevated)" : "var(--bg-card)",
        cursor: "pointer",
        overflow: "hidden",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-elevated)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = isExpanded ? "var(--bg-elevated)" : "var(--bg-card)"; }}
    >
      {/* Blurred banner background */}
      {game.background_image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={game.background_image}
            alt=""
            aria-hidden
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", filter: "blur(18px) brightness(0.18) saturate(1.4)",
              transform: "scale(1.05)",
              pointerEvents: "none",
            }}
          />
          {/* Left fade so cover art stands out */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, transparent 40%)", pointerEvents: "none" }} />
        </>
      )}

      {/* Today accent */}
      {isToday && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: "var(--accent)", zIndex: 2 }} />
      )}

      {/* Date column */}
      <div style={{ position: "relative", zIndex: 2, width: "76px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "12px", color: isToday ? "var(--accent)" : "var(--text-muted)", fontWeight: isToday ? 700 : 400, whiteSpace: "nowrap" }}>
          {game.released ? formatDay(game.released) : "TBA"}
        </span>
      </div>

      {/* Cover art */}
      <div style={{ position: "relative", zIndex: 2, flexShrink: 0, width: "120px", padding: "16px 0" }}>
        <div style={{ width: "100px", height: "130px", borderRadius: "8px", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", background: "var(--bg-elevated)" }}>
          {game.background_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={game.background_image} alt={game.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>🎮</div>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ position: "relative", zIndex: 2, flex: 1, minWidth: 0, padding: "20px 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px" }}>
        {/* Title */}
        <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {game.name}
        </div>

        {/* Platform tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {platforms.map(({ platform }) => {
            const label = PLATFORM_LABELS[platform.slug] || platform.name;
            const color = PLATFORM_COLORS[platform.slug] || "#6b7280";
            return (
              <span key={platform.id} style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", background: `${color}22`, color, border: `1px solid ${color}44`, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {label}
              </span>
            );
          })}
        </div>

        {/* Genre tags */}
        {game.genres?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {game.genres.slice(0, 3).map((genre) => (
              <span key={genre.id} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {genre.name}
              </span>
            ))}
          </div>
        )}

      </div>

      {/* Right side: stats + chevron */}
      <div style={{ position: "relative", zIndex: 2, flexShrink: 0, display: "flex", alignItems: "center", gap: "20px", padding: "0 24px" }}>

        {/* Rating */}
        {game.rating > 0 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
              {game.rating.toFixed(1)}
            </div>
            <div style={{ display: "flex", gap: "2px", justifyContent: "center", margin: "4px 0 2px" }}>
              {[1,2,3,4,5].map((s) => (
                <span key={s} style={{ fontSize: "9px", color: game.rating >= s ? "#facc15" : "rgba(255,255,255,0.15)" }}>★</span>
              ))}
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
              rating
            </div>
          </div>
        )}

        {/* Metacritic */}
        {game.metacritic ? (
          <div style={{
            width: "44px", height: "44px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "15px", fontWeight: 800,
            border: `2px solid ${game.metacritic >= 75 ? "#4ade80" : game.metacritic >= 50 ? "#facc15" : "#f87171"}`,
            color: game.metacritic >= 75 ? "#4ade80" : game.metacritic >= 50 ? "#facc15" : "#f87171",
            background: "rgba(0,0,0,0.4)",
          }}>
            {game.metacritic}
          </div>
        ) : null}

        {/* Temperature gauge hype meter */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          {/* Gauge */}
          <div style={{ position: "relative", width: "18px", height: "70px" }}>
            {/* Track */}
            <div style={{
              position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
              width: "10px", height: "100%",
              borderRadius: "5px",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}>
              {/* Fill */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: `${hype}%`,
                borderRadius: "5px",
                background: hype >= 80
                  ? "linear-gradient(0deg, #ef4444, #f97316)"
                  : hype >= 55
                  ? "linear-gradient(0deg, #f97316, #facc15)"
                  : hype >= 30
                  ? "linear-gradient(0deg, #facc15, #a3e635)"
                  : hype > 0
                  ? "linear-gradient(0deg, #38bdf8, #a3e635)"
                  : "transparent",
                transition: "height 0.8s ease",
              }} />
            </div>
            {/* Bulb at bottom */}
            <div style={{
              position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%)",
              width: "18px", height: "18px", borderRadius: "50%",
              background: hype >= 80 ? "#ef4444"
                : hype >= 55 ? "#f97316"
                : hype >= 30 ? "#facc15"
                : hype > 0 ? "#38bdf8"
                : "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              transition: "background 0.8s ease",
            }} />
          </div>
          {/* Label */}
          <span style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "8px" }}>
            {hype > 0 ? `${hype}%` : "—"}
          </span>
          <span style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>hype</span>
        </div>

        <div style={{
          fontSize: "11px",
          color: isExpanded ? "var(--accent)" : "var(--text-muted)",
          transition: "transform 0.2s, color 0.15s",
          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
        }}>
          ▼
        </div>
      </div>
    </div>
  );
}
