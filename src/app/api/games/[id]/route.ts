import { NextResponse } from "next/server";
import { queryIGDB } from "@/lib/igdb";

function igdbImageUrl(imageId: string, size = "t_cover_big_2x") {
  return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const query = `
    fields name, cover.image_id, first_release_date,
           genres.name, genres.slug,
           platforms.name, platforms.abbreviation, platforms.slug,
           hypes, rating, rating_count, aggregated_rating, aggregated_rating_count,
           summary,
           involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
           screenshots.image_id,
           artworks.image_id,
           videos.video_id, videos.name,
           websites.url, websites.category;
    where id = ${id};
    limit 1;
  `;

  try {
    const results = (await queryIGDB("games", query)) as Record<string, unknown>[];
    if (!results || results.length === 0) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g: any = results[0];

    const releaseDate = g.first_release_date
      ? new Date(g.first_release_date * 1000).toISOString().split("T")[0]
      : null;

    // Official site: IGDB website category 1 = official
    const officialSite = g.websites?.find((w: { category: number; url: string }) => w.category === 1)?.url ?? "";

    const developers = (g.involved_companies ?? [])
      .filter((c: { developer: boolean }) => c.developer)
      .map((c: { company: { name: string } }) => ({ id: 0, name: c.company.name, slug: "" }));

    const publishers = (g.involved_companies ?? [])
      .filter((c: { publisher: boolean }) => c.publisher)
      .map((c: { company: { name: string } }) => ({ id: 0, name: c.company.name, slug: "" }));

    // Screenshots — use highest quality
    const screenshots = (g.screenshots ?? []).slice(0, 8).map((s: { image_id: string }, i: number) => ({
      id: i,
      image: igdbImageUrl(s.image_id, "t_1080p"),
    }));

    // Artworks as background (wider format, better for backdrops)
    const backdropImage = g.artworks?.[0]?.image_id
      ? igdbImageUrl(g.artworks[0].image_id, "t_1080p")
      : g.screenshots?.[0]?.image_id
      ? igdbImageUrl(g.screenshots[0].image_id, "t_1080p")
      : null;

    // Videos from IGDB are YouTube video IDs
    const movies = (g.videos ?? []).slice(0, 3).map((v: { video_id: string; name: string }, i: number) => ({
      id: i,
      name: v.name || "Trailer",
      youtube_id: v.video_id,
      preview: `https://img.youtube.com/vi/${v.video_id}/maxresdefault.jpg`,
      data: {
        max: `https://www.youtube.com/watch?v=${v.video_id}`,
        "480": `https://www.youtube.com/watch?v=${v.video_id}`,
      },
    }));

    return NextResponse.json({
      id: g.id,
      name: g.name,
      released: releaseDate,
      tba: !g.first_release_date,
      background_image: g.cover?.image_id ? igdbImageUrl(g.cover.image_id) : null,
      background_image_additional: backdropImage,
      rating: g.rating ? Math.round((g.rating / 20) * 10) / 10 : 0,
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
      description_raw: g.summary ?? "",
      developers,
      publishers,
      website: officialSite,
      playtime: 0,
      ratings_count: g.rating_count ?? 0,
      esrb_rating: null,
      screenshots,
      movies,
    });
  } catch (err) {
    console.error("IGDB game detail error:", err);
    return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 });
  }
}
