import { NextResponse } from "next/server";
import { queryIGDB } from "@/lib/igdb";

// Normalise IGDB hypes to 0–100%.
// Top anticipated games sit around 200–500 hypes. Cap at 400 = 100%.
const HYPE_CAP = 400;

interface IGDBGame {
  id: number;
  name: string;
  hypes?: number;
  slug?: string;
}

export async function POST(request: Request) {
  try {
    const { names }: { names: string[] } = await request.json();

    if (!names || names.length === 0) {
      return NextResponse.json({ hypes: {} });
    }

    // Build IGDB query — search for up to 40 games by name in one request
    const nameList = names
      .slice(0, 40)
      .map((n) => `"${n.replace(/"/g, "")}"`)
      .join(",");

    const query = `
      fields name, hypes, slug;
      where name = (${nameList});
      limit 40;
    `;

    const results = (await queryIGDB("games", query)) as IGDBGame[];

    // Build a name → hype% map (case-insensitive match)
    const hypeMap: Record<string, number> = {};

    for (const game of results) {
      if (!game.hypes) continue;
      const pct = Math.min(100, Math.round((game.hypes / HYPE_CAP) * 100));
      // Match back to original name (case-insensitive)
      const match = names.find(
        (n) => n.toLowerCase() === game.name.toLowerCase()
      );
      if (match) hypeMap[match] = pct;
    }

    return NextResponse.json({ hypes: hypeMap });
  } catch (err) {
    console.error("IGDB hype error:", err);
    // Fail gracefully — fall back to RAWG-based hype on the frontend
    return NextResponse.json({ hypes: {} });
  }
}
