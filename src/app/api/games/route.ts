import { NextResponse } from "next/server";

const TOKEN_CACHE: { token: string; expires: number } = {
  token: "",
  expires: 0,
};

async function getTwitchToken(): Promise<string> {
  if (TOKEN_CACHE.token && Date.now() < TOKEN_CACHE.expires) {
    return TOKEN_CACHE.token;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET");
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" }
  );

  if (!res.ok) throw new Error("Failed to get Twitch token");

  const data = await res.json();
  TOKEN_CACHE.token = data.access_token;
  TOKEN_CACHE.expires = Date.now() + data.expires_in * 1000 - 60000;

  return TOKEN_CACHE.token;
}

// Map IGDB platform IDs to slugs we use in the UI
const PLATFORM_MAP: Record<number, { name: string; slug: string }> = {
  6: { name: "PC", slug: "pc" },
  167: { name: "PS5", slug: "playstation5" },
  48: { name: "PS4", slug: "playstation4" },
  169: { name: "Xbox Series X/S", slug: "xbox-series-x" },
  49: { name: "Xbox One", slug: "xbox-one" },
  130: { name: "Nintendo Switch", slug: "nintendo-switch" },
  39: { name: "iOS", slug: "ios" },
  34: { name: "Android", slug: "android" },
  14: { name: "Mac", slug: "macos" },
  3: { name: "Linux", slug: "linux" },
};

// IGDB platform IDs for filter mapping
const FILTER_PLATFORM_IDS: Record<string, number[]> = {
  pc: [6],
  ps5: [167],
  xbox: [169],
  switch: [130],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platformFilter = searchParams.get("platform") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 40;
  const offset = (page - 1) * limit;

  const clientId = process.env.TWITCH_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "TWITCH_CLIENT_ID not configured. Add it to your .env.local file.",
      },
      { status: 500 }
    );
  }

  try {
    const token = await getTwitchToken();

    const now = Math.floor(Date.now() / 1000);
    const nineMonths = now + 60 * 60 * 24 * 30 * 9;

    // Build platform filter
    let platformClause = "";
    if (platformFilter !== "all" && FILTER_PLATFORM_IDS[platformFilter]) {
      const ids = FILTER_PLATFORM_IDS[platformFilter].join(",");
      platformClause = `& platforms = (${ids})`;
    }

    const body = `
      fields name, cover.url, first_release_date, platforms.id, platforms.name, genres.name, aggregated_rating, aggregated_rating_count;
      where first_release_date > ${now} & first_release_date < ${nineMonths} & category = 0 ${platformClause};
      sort first_release_date asc;
      limit ${limit};
      offset ${offset};
    `;

    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("IGDB error:", text);
      return NextResponse.json(
        { error: "IGDB request failed" },
        { status: res.status }
      );
    }

    const raw = await res.json();

    // Normalize to a shape similar to what our components expect
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = raw.map((g: any) => {
      const releaseDate = g.first_release_date
        ? new Date(g.first_release_date * 1000).toISOString().split("T")[0]
        : null;

      const coverUrl = g.cover?.url
        ? "https:" + g.cover.url.replace("t_thumb", "t_cover_big")
        : null;

      const platforms = g.platforms
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          g.platforms.map((p: any) => ({
            platform: PLATFORM_MAP[p.id] ?? { name: p.name, slug: "other" },
          }))
        : [];

      const metacritic =
        g.aggregated_rating && g.aggregated_rating_count > 3
          ? Math.round(g.aggregated_rating)
          : null;

      return {
        id: g.id,
        name: g.name,
        released: releaseDate,
        background_image: coverUrl,
        rating: g.aggregated_rating ?? 0,
        metacritic,
        platforms,
        genres: g.genres ?? [],
        tba: !releaseDate,
      };
    });

    // Check if there are more results
    const countRes = await fetch("https://api.igdb.com/v4/games/count", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `where first_release_date > ${now} & first_release_date < ${nineMonths} & category = 0 ${platformClause};`,
    });
    const countData = countRes.ok ? await countRes.json() : { count: 0 };
    const total = countData.count ?? 0;

    return NextResponse.json({
      count: total,
      next: offset + limit < total ? "yes" : null,
      results,
    });
  } catch (err) {
    console.error("Games API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
