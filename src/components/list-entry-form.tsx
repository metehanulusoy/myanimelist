"use client";

import { useState, useTransition } from "react";
import { Heart, Trash2 } from "lucide-react";
import { STATUS_LABELS, type ListEntry, type ListStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { removeListEntry, upsertListEntry } from "@/app/anime/[id]/actions";

const ORDER: ListStatus[] = [
  "watching",
  "completed",
  "plan_to_watch",
  "on_hold",
  "dropped",
];

export function ListEntryForm({
  animeId,
  totalEpisodes,
  entry,
}: {
  animeId: number;
  totalEpisodes: number | null;
  entry: ListEntry | null;
}) {
  const [status, setStatus] = useState<ListStatus>(entry?.status ?? "plan_to_watch");
  const [score, setScore] = useState<string>(entry?.score ? String(entry.score) : "");
  const [episodes, setEpisodes] = useState<number>(entry?.episodes_watched ?? 0);
  const [favorite, setFavorite] = useState<boolean>(entry?.is_favorite ?? false);
  const [notes, setNotes] = useState<string>(entry?.notes ?? "");
  const [pending, startTransition] = useTransition();

  function submit() {
    const fd = new FormData();
    fd.set("anime_id", String(animeId));
    fd.set("status", status);
    fd.set("score", score);
    fd.set("episodes_watched", String(episodes));
    fd.set("notes", notes);
    if (favorite) fd.set("is_favorite", "on");
    startTransition(async () => {
      await upsertListEntry(fd);
    });
  }

  function remove() {
    if (!entry) return;
    const fd = new FormData();
    fd.set("anime_id", String(animeId));
    startTransition(async () => {
      await removeListEntry(fd);
    });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Listene ekle</h3>
        <button
          type="button"
          onClick={() => setFavorite((v) => !v)}
          aria-pressed={favorite}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition",
            favorite
              ? "border-pink-400/40 bg-pink-500/10 text-pink-200"
              : "border-white/10 text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", favorite && "fill-pink-300")} />
          {favorite ? "Favori" : "Favoriye ekle"}
        </button>
      </div>

      <div className="mb-4">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-zinc-400">
          Durum
        </span>
        <div className="flex flex-wrap gap-1.5">
          {ORDER.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs transition",
                status === s
                  ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-100"
                  : "border-white/10 text-zinc-400 hover:text-zinc-200"
              )}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-zinc-400">
            Puan (1–10)
          </span>
          <input
            type="number"
            min={1}
            max={10}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="-"
            className="w-full rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-zinc-400">
            Bölüm{totalEpisodes ? ` / ${totalEpisodes}` : ""}
          </span>
          <input
            type="number"
            min={0}
            max={totalEpisodes ?? undefined}
            value={episodes}
            onChange={(e) => setEpisodes(Number(e.target.value) || 0)}
            className="w-full rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm"
          />
        </label>
      </div>

      <label className="mb-4 block">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-zinc-400">
          Not
        </span>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full resize-none rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm"
          placeholder="Yalnızca senin gördüğün bir not bırak…"
        />
      </label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="inline-flex flex-1 items-center justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 disabled:opacity-60"
        >
          {pending ? "Kaydediliyor…" : entry ? "Güncelle" : "Listeme ekle"}
        </button>
        {entry ? (
          <button
            type="button"
            disabled={pending}
            onClick={remove}
            className="inline-flex items-center justify-center rounded-md border border-white/10 px-2.5 py-2 text-zinc-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-200 disabled:opacity-60"
            aria-label="Listeden kaldır"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
