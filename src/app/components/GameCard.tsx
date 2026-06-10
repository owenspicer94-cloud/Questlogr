import Image from "next/image";
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
  const priority = [
    "playstation5",
    "xbox-series-x",
    "pc",
    "nintendo-switch",
    "playstation4",
    "xbox-one",
    "ios",
    "android",
  ];
  const sorted = [...platforms].sort((a, b) => {
    const ai = priority.indexOf(a.platform.slug);
    const bi = priority.indexOf(b.platform.slug);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  return sorted.slice(0, 4);
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface GameCardProps {
  game: Game;
  isToday?: boolean;
}

export default function GameCard({ game, isToday }: GameCardProps) {
  const platforms = getTopPlatforms(game.platforms);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "12px 16px",
        borderRadius: "10px",
        border: "1px solid var(--border)",
        background: "var(--bg-card)",
        transition: "border-color 0.15s, background 0.15s",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "var(--border-hover)";
        (e.currentTarget as HTMLDivElement).style.background =
          "var(--bg-elevated)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)";
      }}
    >
      {isToday && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "3px",
            background: "var(--accent)",
            borderRadius: "10px 0 0 10px",
          }}
        />
      )}

      {/* Date */}
      <div
        style={{
          minWidth: "52px",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: isToday ? "var(--accent)" : "var(--text-muted)",
            fontWeight: isToday ? 600 : 400,
            whiteSpace: "nowrap",
          }}
        >
          {game.released ? formatDay(game.released) : "TBA"}
        </span>
      </div>

      {/* Cover art */}
      <div
        style={{
          width: "56px",
          height: "72px",
          borderRadius: "6px",
          overflow: "hidden",
          flexShrink: 0,
          background: "var(--bg-elevated)",
          position: "relative",
        }}
      >
        {game.background_image ? (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            sizes="56px"
            style={{ objectFit: "cover" }}
            unoptimized
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            🎮
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: "14px",
            color: "var(--text-primary)",
            marginBottom: "6px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {game.name}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {platforms.map(({ platform }) => {
            const label =
              PLATFORM_LABELS[platform.slug] || platform.name;
            const color = PLATFORM_COLORS[platform.slug] || "#6b7280";
            return (
              <span
                key={platform.id}
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "2px 7px",
                  borderRadius: "4px",
                  background: `${color}22`,
                  color: color,
                  border: `1px solid ${color}44`,
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </span>
            );
          })}
          {game.genres?.slice(0, 2).map((genre) => (
            <span
              key={genre.id}
              style={{
                fontSize: "10px",
                padding: "2px 7px",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.04)",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              {genre.name}
            </span>
          ))}
        </div>
      </div>

      {/* Score */}
      {game.metacritic && (
        <div
          style={{
            flexShrink: 0,
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 700,
            border: `2px solid ${
              game.metacritic >= 75
                ? "#4ade80"
                : game.metacritic >= 50
                ? "#facc15"
                : "#f87171"
            }`,
            color:
              game.metacritic >= 75
                ? "#4ade80"
                : game.metacritic >= 50
                ? "#facc15"
                : "#f87171",
          }}
        >
          {game.metacritic}
        </div>
      )}
    </div>
  );
}
