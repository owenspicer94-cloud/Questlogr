import { NextResponse } from "next/server";

interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q) return NextResponse.json({ videos: [] });

  try {
    const query = encodeURIComponent(`${q} trailer gameplay`);
    // sp=EgIQAQ%3D%3D filters to videos only
    const url = `https://www.youtube.com/results?search_query=${query}&sp=EgIQAQ%3D%3D`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html",
      },
      next: { revalidate: 3600 },
    });

    const html = await res.text();

    // Extract ytInitialData JSON blob
    const marker = "var ytInitialData = ";
    const start = html.indexOf(marker);
    if (start === -1) return NextResponse.json({ videos: [] });

    const jsonStart = start + marker.length;
    const jsonEnd = html.indexOf(";</script>", jsonStart);
    if (jsonEnd === -1) return NextResponse.json({ videos: [] });

    const rawJson = html.slice(jsonStart, jsonEnd);
    const data = JSON.parse(rawJson);

    // Navigate to search results
    const sections =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents ?? [];

    const videos: VideoResult[] = [];

    for (const section of sections) {
      const items = section?.itemSectionRenderer?.contents ?? [];
      for (const item of items) {
        const v = item?.videoRenderer;
        if (!v?.videoId) continue;

        const thumbnails: { url: string; width: number }[] =
          v.thumbnail?.thumbnails ?? [];
        const bestThumb =
          thumbnails.sort(
            (a: { width: number }, b: { width: number }) => b.width - a.width
          )[0]?.url ?? "";

        const title =
          v.title?.runs?.map((r: { text: string }) => r.text).join("") ??
          v.title?.simpleText ??
          "";
        const channel =
          v.ownerText?.runs?.[0]?.text ??
          v.longBylineText?.runs?.[0]?.text ??
          "";

        videos.push({
          id: v.videoId,
          title,
          thumbnail: bestThumb,
          channel,
        });

        if (videos.length >= 5) break;
      }
      if (videos.length >= 5) break;
    }

    return NextResponse.json({ videos });
  } catch (err) {
    console.error("YouTube media error:", err);
    return NextResponse.json({ videos: [] });
  }
}
