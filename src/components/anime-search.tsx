"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

interface Result {
  mal_id: number;
  title: string;
  title_english: string | null;
  year: number | null;
  type: string | null;
  episodes: number | null;
  score: number | null;
  cover_image_url: string | null;
}

export function AnimeSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isFetching } = useQuery<{ data: Result[] }>({
    queryKey: ["search", debounced],
    enabled: debounced.length >= 2,
    queryFn: async () => {
      const res = await fetch(`/api/anime/search?q=${encodeURIComponent(debounced)}`);
      if (!res.ok) throw new Error("search failed");
      return res.json();
    },
  });

  const results = data?.data ?? [];

  return (
    <div className="w-full">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus={autoFocus}
          placeholder="Anime ara (örn. Frieren, Bleach)…"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm placeholder:text-zinc-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
        />
      </label>

      {debounced.length >= 2 ? (
        <div className="mt-6">
          {isFetching && results.length === 0 ? (
            <p className="text-sm text-zinc-400">Aranıyor…</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-zinc-400">Sonuç bulunamadı.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {results.map((r) => (
                <li key={r.mal_id}>
                  <Link
                    href={`/anime/${r.mal_id}`}
                    className="group block overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-indigo-400/40 hover:bg-white/10"
                  >
                    <div className="relative aspect-[2/3] w-full bg-black/20">
                      {r.cover_image_url ? (
                        <Image
                          src={r.cover_image_url}
                          alt={r.title}
                          fill
                          sizes="(max-width: 768px) 33vw, 200px"
                          className="object-cover transition group-hover:scale-[1.03]"
                        />
                      ) : null}
                      {r.score ? (
                        <span className="absolute right-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-xs text-amber-200">
                          ★ {r.score.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                    <div className="p-2.5">
                      <p className="line-clamp-2 text-sm font-medium text-zinc-100">
                        {r.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {r.type ?? "—"}
                        {r.year ? ` · ${r.year}` : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="mt-4 text-xs text-zinc-500">
          Aramaya başlamak için en az 2 karakter yaz.
        </p>
      )}
    </div>
  );
}
