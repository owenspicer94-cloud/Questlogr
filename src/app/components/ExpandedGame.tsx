"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Game } from "../types";

interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
}

interface NewsArticle {
  title: string;
  source: string;
  link: string;
  published: string;
}

interface ExpandedGameProps {
  gameId: number;
  gameName: string;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function ExpandedGame({ gameId, gameName }: ExpandedGameProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [hitlist, setHitlist] = useState(false);
  const [played, setPlayed] = useState(false);

  // Inline RAWG video player
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // YouTube & news
  const [youtubeVideos, setYoutubeVideos] = useState<VideoResult[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [embeddedVideoId, setEmbeddedVideoId] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(true);

  useEffect(() => {
    setGame(null);
    setLoading(true);
    setMediaLoading(true);
    setEmbeddedVideoId(null);

    fetch(`/api/games/${gameId}`)
      .then((r) => r.json())
      .then((data) => {
        setGame(data);
        if (data.movies?.length) {
          setActiveVideo(data.movies[0].data?.max || data.movies[0].data?.["480"] || null);
        }
      })
      .finally(() => setLoading(false));

    // Fetch YouTube & news in parallel
    Promise.all([
      fetch(`/api/media/youtube?q=${encodeURIComponent(gameName)}`).then((r) => r.json()),
      fetch(`/api/media/news?q=${encodeURIComponent(gameName)}`).then((r) => r.json()),
    ]).then(([ytData, newsData]) => {
      setYoutubeVideos(ytData.videos ?? []);
      setNews(newsData.articles ?? []);
    }).finally(() => setMediaLoading(false));
  }, [gameId, gameName]);

  if (loading) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px", borderTop: "1px solid var(--border)", background: "var(--bg-elevated)", borderRadius: "0 0 12px 12px" }}>
        Loading…
      </div>
    );
  }

  if (!game) return null;

  return (
    <>
      {/* Screenshot lightbox */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}
        >
          <button
            onClick={() => setLightboxImg(null)}
            style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: "22px", width: "44px", height: "44px", borderRadius: "50%", cursor: "pointer" }}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImg}
            alt="Screenshot"
            style={{ maxWidth: "95vw", maxHeight: "90vh", objectFit: "contain", borderRadius: "8px" }}
          />
        </div>
      )}

      {/* YouTube embed overlay */}
      {embeddedVideoId && (
        <div
          onClick={() => setEmbeddedVideoId(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <button
            onClick={() => setEmbeddedVideoId(null)}
            style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: "22px", width: "44px", height: "44px", borderRadius: "50%", cursor: "pointer", zIndex: 1 }}
          >
            ✕
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(960px, 92vw)", aspectRatio: "16/9" }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${embeddedVideoId}?autoplay=1&rel=0`}
              allow="autoplay; fullscreen"
              allowFullScreen
              style={{ width: "100%", height: "100%", border: "none", borderRadius: "12px" }}
            />
          </div>
        </div>
      )}

      <div style={{ borderTop: "1px solid rgba(124,106,247,0.2)", background: "linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-card) 100%)", borderRadius: "0 0 12px 12px", overflow: "hidden" }}>

        {/* Developer / meta strip */}
        {(game.developers?.length || game.playtime || game.esrb_rating) && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 24px 0", flexWrap: "wrap" }}>
            {game.developers && game.developers.length > 0 && (
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
                {game.developers.map((d) => d.name).join(", ")}
              </span>
            )}
            {game.playtime ? <span style={{ fontSize: "12px", color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: "4px", border: "1px solid var(--border)" }}>⏱ ~{game.playtime}h</span> : null}
            {game.esrb_rating && <span style={{ fontSize: "12px", color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: "4px", border: "1px solid var(--border)" }}>{game.esrb_rating.name}</span>}
          </div>
        )}

        <div style={{ padding: "20px 24px 28px" }}>
          {/* Action buttons */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
            <button onClick={(e) => { e.stopPropagation(); setHitlist((v) => !v); }}
              style={{ padding: "10px 20px", borderRadius: "8px", border: `1px solid ${hitlist ? "var(--accent)" : "var(--border-hover)"}`, background: hitlist ? "var(--accent-dim)" : "var(--bg-card)", color: hitlist ? "var(--accent)" : "var(--text-primary)", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
              {hitlist ? "✓ On Hitlist" : "+ Add to Hitlist"}
            </button>
            <button onClick={(e) => { e.stopPropagation(); setPlayed((v) => !v); }}
              style={{ padding: "10px 20px", borderRadius: "8px", border: `1px solid ${played ? "#4ade80" : "var(--border-hover)"}`, background: played ? "rgba(74,222,128,0.1)" : "var(--bg-card)", color: played ? "#4ade80" : "var(--text-primary)", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
              {played ? "✓ Played" : "🎮 Mark as Played"}
            </button>
          </div>

          {/* Description */}
          {game.description_raw && (
            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "10px" }}>About</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.75, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {game.description_raw}
              </p>
            </div>
          )}

          {/* Trailers */}
          {game.movies && game.movies.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>
                {game.movies.length > 1 ? "Trailers" : "Official Trailer"}
              </h3>
              {game.movies[0].youtube_id ? (
                // IGDB YouTube trailers — embed directly
                <div>
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border)" }}
                    onClick={(e) => e.stopPropagation()}>
                    <iframe
                      src={`https://www.youtube.com/embed/${game.movies.find((m, i) => i === (game.movies!.indexOf(game.movies!.find(mv => mv.youtube_id === activeVideo?.replace("https://www.youtube.com/watch?v=", "")) || game.movies![0])))?.youtube_id || game.movies[0].youtube_id}?rel=0`}
                      allow="autoplay; fullscreen"
                      allowFullScreen
                      style={{ width: "100%", height: "100%", border: "none" }}
                    />
                  </div>
                  {game.movies.length > 1 && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      {game.movies.map((m) => (
                        <button
                          key={m.id}
                          onClick={(e) => { e.stopPropagation(); setActiveVideo(m.data?.max || null); }}
                          style={{ position: "relative", width: "80px", height: "50px", borderRadius: "6px", overflow: "hidden", border: `2px solid ${activeVideo === m.data?.max ? "var(--accent)" : "var(--border)"}`, cursor: "pointer", padding: 0, background: "var(--bg-elevated)", flexShrink: 0 }}
                        >
                          {m.preview && <img src={m.preview} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Fallback video element
                <video
                  key={activeVideo || ""}
                  src={activeVideo || ""}
                  controls
                  poster={game.movies[0]?.preview}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: "100%", maxHeight: "360px", borderRadius: "10px", background: "#000", border: "1px solid var(--border)" }}
                />
              )}
            </div>
          )}

          {/* Screenshots */}
          {game.screenshots && game.screenshots.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>Screenshots</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
                {game.screenshots.map((s) => (
                  <div
                    key={s.id}
                    onClick={(e) => { e.stopPropagation(); setLightboxImg(s.image); }}
                    style={{ position: "relative", aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden", background: "var(--bg-elevated)", cursor: "zoom-in", border: "1px solid var(--border)", transition: "transform 0.15s, border-color 0.15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.02)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(124,106,247,0.4)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image} alt="Screenshot" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* YouTube videos */}
          <div style={{ marginBottom: "28px" }}>
            <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>
              YouTube
            </h3>
            {mediaLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ aspectRatio: "16/9", borderRadius: "8px", background: "var(--bg-elevated)", animation: "pulse 1.5s ease-in-out infinite" }} />
                ))}
              </div>
            ) : youtubeVideos.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                {youtubeVideos.map((v) => (
                  <div
                    key={v.id}
                    onClick={(e) => { e.stopPropagation(); setEmbeddedVideoId(v.id); }}
                    style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-elevated)", cursor: "pointer", transition: "border-color 0.15s, transform 0.15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#ff4444"; (e.currentTarget as HTMLDivElement).style.transform = "scale(1.02)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
                  >
                    {/* Thumbnail */}
                    <div style={{ position: "relative", aspectRatio: "16/9" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {v.thumbnail && <img src={v.thumbnail} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      {/* Play button overlay */}
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)", opacity: 0, transition: "opacity 0.15s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0"; }}
                      >
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#ff0000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>▶</div>
                      </div>
                    </div>
                    <div style={{ padding: "8px 10px 10px" }}>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "3px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>
                        {v.title}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{v.channel}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(gameName + " trailer gameplay")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "8px 16px", borderRadius: "8px", background: "rgba(255,0,0,0.1)", border: "1px solid rgba(255,0,0,0.2)", color: "#ff4444", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
              >
                ▶ Search YouTube
              </a>
            )}
          </div>

          {/* News */}
          <div>
            <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>
              News
            </h3>
            {mediaLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ height: "56px", borderRadius: "8px", background: "var(--bg-elevated)", animation: "pulse 1.5s ease-in-out infinite" }} />
                ))}
              </div>
            ) : news.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {news.map((article, i) => (
                  <a
                    key={i}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border)", textDecoration: "none", transition: "border-color 0.15s, background 0.15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(124,106,247,0.35)"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(124,106,247,0.05)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-elevated)"; }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {article.title}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {article.source}{article.published ? ` · ${formatDate(article.published)}` : ""}
                      </p>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", flexShrink: 0 }}>→</span>
                  </a>
                ))}
              </div>
            ) : (
              <a
                href={`https://news.google.com/search?q=${encodeURIComponent(gameName)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "8px 16px", borderRadius: "8px", background: "rgba(66,133,244,0.1)", border: "1px solid rgba(66,133,244,0.2)", color: "#4285f4", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
              >
                📰 Search Google News
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
