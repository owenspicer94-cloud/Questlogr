import { NextResponse } from "next/server";

interface NewsArticle {
  title: string;
  source: string;
  link: string;
  published: string;
  image?: string;
}

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function extractItems(xml: string): string[] {
  const items: string[] = [];
  let pos = 0;
  while (pos < xml.length) {
    const start = xml.indexOf("<item>", pos);
    if (start === -1) break;
    const end = xml.indexOf("</item>", start);
    if (end === -1) break;
    items.push(xml.slice(start + 6, end));
    pos = end + 7;
  }
  return items;
}

function getTag(xml: string, tag: string): string {
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  const cdataOpen = `<${tag}><![CDATA[`;
  const cdataClose = `]]></${tag}>`;

  // Try CDATA first
  const cs = xml.indexOf(cdataOpen);
  if (cs !== -1) {
    const ce = xml.indexOf(cdataClose, cs);
    if (ce !== -1) return xml.slice(cs + cdataOpen.length, ce).trim();
  }

  const s = xml.indexOf(open);
  if (s === -1) return "";
  const e = xml.indexOf(close, s);
  if (e === -1) return "";
  return decodeHtml(xml.slice(s + open.length, e).trim());
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q) return NextResponse.json({ articles: [] });

  try {
    const query = encodeURIComponent(`${q} game`);
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

    const res = await fetch(rssUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RSS reader)" },
      next: { revalidate: 1800 },
    });

    const xml = await res.text();
    const itemBlocks = extractItems(xml);

    const articles: NewsArticle[] = itemBlocks.slice(0, 6).map((block) => {
      const rawTitle = getTag(block, "title");
      // Google News titles have source appended: "Title - Source"
      const dashIdx = rawTitle.lastIndexOf(" - ");
      const title = dashIdx !== -1 ? rawTitle.slice(0, dashIdx).trim() : rawTitle;
      const source = dashIdx !== -1 ? rawTitle.slice(dashIdx + 3).trim() : "";

      // Get link - try <link> tag, fallback to guid
      let link = getTag(block, "link");
      if (!link) link = getTag(block, "guid");

      const published = getTag(block, "pubDate");

      return { title, source, link, published };
    });

    return NextResponse.json({ articles });
  } catch (err) {
    console.error("News RSS error:", err);
    return NextResponse.json({ articles: [] });
  }
}
