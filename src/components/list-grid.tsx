import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { STATUS_LABELS, type ListEntryWithAnime } from "@/lib/supabase/types";

export function ListGrid({ entries }: { entries: ListEntryWithAnime[] }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
        Henüz hiç anime eklenmemiş.
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {entries.map((e) => (
        <li key={e.id}>
          <Link
            href={`/anime/${e.anime_id}`}
            className="group block overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-indigo-400/40 hover:bg-white/10"
          >
            <div className="relative aspect-[2/3] w-full bg-black/20">
              {e.anime?.cover_image_url ? (
                <Image
                  src={e.anime.cover_image_url}
                  alt={e.anime.title}
                  fill
                  sizes="(max-width: 768px) 33vw, 200px"
                  className="object-cover transition group-hover:scale-[1.03]"
                />
              ) : null}
              <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-200">
                {STATUS_LABELS[e.status]}
              </span>
              {e.score ? (
                <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-md bg-black/60 px-1.5 py-0.5 text-xs text-amber-200">
                  <Star className="h-3 w-3 fill-amber-300" /> {e.score}
                </span>
              ) : null}
            </div>
            <div className="p-2.5">
              <p className="line-clamp-2 text-sm font-medium">
                {e.anime?.title ?? `#${e.anime_id}`}
              </p>
              {e.anime?.episodes ? (
                <p className="mt-1 text-xs text-zinc-400">
                  {e.episodes_watched}/{e.anime.episodes} bölüm
                </p>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
