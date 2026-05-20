import { getAnime, toAnimeCacheRow } from "@/lib/jikan";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { AnimeCache } from "@/lib/supabase/types";

const FRESH_MS = 1000 * 60 * 60 * 24 * 7; // 7 gün

// İlgili anime kaydını veritabanında bulur; yoksa Jikan'dan çeker, cache'e yazar ve döner.
export async function getOrFetchAnime(malId: number): Promise<AnimeCache | null> {
  const supabase = await createSupabaseServerClient();
  const { data: cached } = await supabase
    .from("anime_cache")
    .select("*")
    .eq("id", malId)
    .maybeSingle();

  if (cached) {
    const age = Date.now() - new Date(cached.cached_at).getTime();
    if (age < FRESH_MS) return cached as AnimeCache;
  }

  let fresh;
  try {
    fresh = await getAnime(malId);
  } catch {
    return (cached as AnimeCache | null) ?? null;
  }
  const row = toAnimeCacheRow(fresh);

  // Cache'e yazmak için service role gerekli (anon rolü insert yapamaz).
  try {
    const admin = createSupabaseServiceRoleClient();
    await admin.from("anime_cache").upsert(row, { onConflict: "id" });
  } catch {
    // Service role henüz konfigure edilmemişse sessizce geç; veriyi yine döneriz.
  }
  return row as AnimeCache;
}
