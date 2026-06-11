import { NextResponse } from "next/server";
import { queryIGDB } from "@/lib/igdb";

// Map our filter values to IGDB platform IDs
const PLATFORM_MAP: Record<string, number[]> = {
  "4":   [6],   // PC (Windows)
  "187": [167], // PS5
  "186": [169], // Xbox Series X
  "7":   [130], // Nintendo Switch
};

// Major platforms to show when "All" is selected
const ALL_PLATFORMS = [6, 48, 49, 130, 167, 169];

function igdbImageUrl(imageId: string, size = "t_cover_big_2x") {
  return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGame(g: any) {
  const releaseDate = g.first_release_date
    ? new Date(g.first_release_date * 1000).toISOString().split("T")[0]
    : null;

  return {
    id: g.id,
    name: g.name,
    released: releaseDate,
    tba: !g.first_release_date,
    background_image: g.cover?.image_id ? igdbImageUrl(g.cover.image_id) : null,
    // IGDB rating is 0-100; map to 0-5 for consistency
    rating: g.rating ? Math.round((g.rating / 20) * 10) / 10 : 0,
    // aggregated_rating is critic score (like Metacritic)
    metacritic: g.aggregated_rating ? Math.round(g.aggregated_rating) : null,
    platforms: (g.platforms ?? []).map((p: { id: number; name: string; abbreviation?: string; slug?: string }) => ({
      platform: { id: p.id, name: p.abbreviation || p.name, slug: p.slug || p.name.toLowerCase() },
    })),
    genres: (g.genres ?? []).map((genre: { id: number; name: string; slug?: string }) => ({
      id: genre.id,
      name: genre.name,
      slug: genre.slug,
    })),
    added: g.hypes ?? 0,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const offset = (page - 1) * 40;

  const now = Math.floor(Date.now() / 1000);
  const nineMonthsLater = now + 9 * 30 * 24 * 60 * 60;

  const platformIds =
    platform !== "all" && PLATFORM_MAP[platform]
      ? PLATFORM_MAP[platform]
      : ALL_PLATFORMS;

  const query = `
    fields name, cover.image_id, first_release_date,
           genres.name, genres.slug,
           platforms.name, platforms.abbreviation, platforms.slug,
           hypes, rating, rating_count, aggregated_rating;
    where first_release_date > ${now}
      & first_release_date < ${nineMonthsLater}
      & platforms = (${platformIds.join(",")})
      & version_parent = null;
    sort first_release_date asc;
    limit 40;
    offset ${offset};
  `;

  try {
    const results = (await queryIGDB("games", query)) as unknown[];
    const games = results.map(mapGame);

    return NextResponse.json({
      count: games.length,
      next: games.length === 40 ? "has_more" : null,
      results: games,
    });
  } catch (err) {
    console.error("IGDB games error:", err);
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}
