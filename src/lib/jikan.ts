// Jikan API v4 — https://docs.api.jikan.moe/
// Kimlik doğrulamasız, ~60 istek/dk.

const JIKAN_BASE = "https://api.jikan.moe/v4";

export interface JikanImage {
  jpg?: { image_url?: string; large_image_url?: string };
  webp?: { image_url?: string; large_image_url?: string };
}

export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  synopsis: string | null;
  images: JikanImage;
  episodes: number | null;
  score: number | null;
  type: string | null;
  status: string | null;
  season: string | null;
  year: number | null;
  genres: { name: string }[];
  studios: { name: string }[];
  rating?: string | null;
  duration?: string | null;
}

export interface JikanSearchResponse {
  data: JikanAnime[];
  pagination?: {
    has_next_page: boolean;
    current_page: number;
    last_visible_page: number;
  };
}

async function jikanFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${JIKAN_BASE}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
    // 6 saatlik ISR önbelleği — Jikan rate limit'i için kritik
    next: { revalidate: 60 * 60 * 6 },
  });
  if (!res.ok) {
    throw new Error(`Jikan ${path} -> ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function searchAnime(query: string, limit = 12) {
  if (!query.trim()) return [];
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    sfw: "true",
    order_by: "popularity",
    sort: "asc",
  });
  const json = await jikanFetch<JikanSearchResponse>(`/anime?${params}`);
  return json.data;
}

export async function getAnime(id: number) {
  const json = await jikanFetch<{ data: JikanAnime }>(`/anime/${id}/full`);
  return json.data;
}

export function jikanCover(a: JikanAnime): string | null {
  return (
    a.images?.webp?.large_image_url ||
    a.images?.jpg?.large_image_url ||
    a.images?.webp?.image_url ||
    a.images?.jpg?.image_url ||
    null
  );
}

// Jikan -> anime_cache satırı dönüşümü
export function toAnimeCacheRow(a: JikanAnime) {
  return {
    id: a.mal_id,
    title: a.title,
    title_english: a.title_english,
    synopsis: a.synopsis,
    cover_image_url: jikanCover(a),
    episodes: a.episodes,
    genres: a.genres?.map((g) => g.name) ?? [],
    studio: a.studios?.[0]?.name ?? null,
    season:
      a.season && a.year ? `${capitalize(a.season)} ${a.year}` : a.season ?? null,
    year: a.year,
    type: a.type,
    external_score: a.score,
    cached_at: new Date().toISOString(),
  };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
