import { NextRequest, NextResponse } from "next/server";
import { jikanCover, searchAnime } from "@/lib/jikan";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ data: [] });

  try {
    const results = await searchAnime(q, 12);
    return NextResponse.json({
      data: results.map((a) => ({
        mal_id: a.mal_id,
        title: a.title,
        title_english: a.title_english,
        year: a.year,
        type: a.type,
        episodes: a.episodes,
        score: a.score,
        cover_image_url: jikanCover(a),
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
