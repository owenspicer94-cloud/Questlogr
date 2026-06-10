import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") || "all";
  const page = searchParams.get("page") || "1";

  const apiKey = process.env.RAWG_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "RAWG_API_KEY not configured." },
      { status: 500 }
    );
  }

  const today = new Date();
  const nineMonthsLater = new Date(today);
  nineMonthsLater.setMonth(today.getMonth() + 9);

  const fromDate = today.toISOString().split("T")[0];
  const toDate = nineMonthsLater.toISOString().split("T")[0];

  // RAWG platform IDs
  const platformIds: Record<string, string> = {
    "4": "4",    // PC
    "187": "187", // PS5
    "186": "186", // Xbox Series X
    "7": "7",    // Nintendo Switch
  };

  const params = new URLSearchParams({
    key: apiKey,
    dates: `${fromDate},${toDate}`,
    ordering: "released",
    page_size: "40",
    page,
    ...(platform !== "all" && platformIds[platform]
      ? { platforms: platformIds[platform] }
      : {}),
  });

  try {
    const res = await fetch(`https://api.rawg.io/api/games?${params}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from RAWG" },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Normalize to our Game shape
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = data.results.map((g: any) => ({
      id: g.id,
      name: g.name,
      released: g.released ?? null,
      background_image: g.background_image ?? null,
      rating: g.rating ?? 0,
      metacritic: g.metacritic ?? null,
      platforms: g.platforms ?? [],
      genres: g.genres ?? [],
      tba: g.tba ?? false,
    }));

    return NextResponse.json({
      count: data.count,
      next: data.next,
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
