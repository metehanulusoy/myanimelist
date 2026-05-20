import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrFetchAnime } from "@/lib/anime-cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListEntryForm } from "@/components/list-entry-form";
import type { ListEntry } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AnimeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const malId = Number(id);
  if (!Number.isFinite(malId) || malId <= 0) notFound();

  const anime = await getOrFetchAnime(malId);
  if (!anime) notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let entry: ListEntry | null = null;
  if (user) {
    const { data } = await supabase
      .from("list_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("anime_id", malId)
      .maybeSingle();
    entry = (data as ListEntry | null) ?? null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          {anime.cover_image_url ? (
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <Image
                src={anime.cover_image_url}
                alt={anime.title}
                fill
                sizes="280px"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="aspect-[2/3] rounded-2xl border border-white/10 bg-white/5" />
          )}

          {user ? (
            <ListEntryForm
              animeId={malId}
              totalEpisodes={anime.episodes}
              entry={entry}
            />
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              Listene eklemek için{" "}
              <Link href="/login" className="text-indigo-300 hover:text-indigo-200">
                giriş yap
              </Link>{" "}
              veya{" "}
              <Link href="/register" className="text-indigo-300 hover:text-indigo-200">
                kayıt ol
              </Link>
              .
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-indigo-300">
            {anime.type ?? "Anime"} · {anime.season ?? "—"}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
            {anime.title}
          </h1>
          {anime.title_english && anime.title_english !== anime.title ? (
            <p className="mt-1 text-zinc-400">{anime.title_english}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-300">
            {anime.external_score ? (
              <Stat label="MAL puanı" value={anime.external_score.toFixed(2)} accent />
            ) : null}
            {anime.episodes ? <Stat label="Bölüm" value={String(anime.episodes)} /> : null}
            {anime.studio ? <Stat label="Stüdyo" value={anime.studio} /> : null}
          </div>

          {anime.genres && anime.genres.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {anime.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300"
                >
                  {g}
                </span>
              ))}
            </div>
          ) : null}

          <h2 className="mt-8 text-lg font-semibold">Özet</h2>
          <p className="mt-2 whitespace-pre-line text-zinc-300 leading-relaxed">
            {anime.synopsis ?? "Bu anime için henüz özet bulunmuyor."}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "rounded-md border px-2.5 py-1 " +
        (accent
          ? "border-indigo-400/40 bg-indigo-500/10 text-indigo-100"
          : "border-white/10 bg-white/5")
      }
    >
      <span className="mr-1 text-xs uppercase tracking-wide text-zinc-400">
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
