"use client";

import { useMemo, useState } from "react";
import { STATUS_LABELS, type ListEntryWithAnime, type ListStatus } from "@/lib/supabase/types";
import { ListGrid } from "./list-grid";
import { cn } from "@/lib/utils";

const ORDER: (ListStatus | "all")[] = [
  "all",
  "watching",
  "completed",
  "plan_to_watch",
  "on_hold",
  "dropped",
];

const LABELS: Record<ListStatus | "all", string> = {
  all: "Hepsi",
  ...STATUS_LABELS,
};

export function StatusTabs({ entries }: { entries: ListEntryWithAnime[] }) {
  const [active, setActive] = useState<ListStatus | "all">("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: entries.length };
    for (const e of entries) c[e.status] = (c[e.status] ?? 0) + 1;
    return c;
  }, [entries]);

  const filtered = useMemo(
    () => (active === "all" ? entries : entries.filter((e) => e.status === active)),
    [entries, active]
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {ORDER.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActive(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition",
              active === s
                ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-100"
                : "border-white/10 text-zinc-400 hover:text-zinc-200"
            )}
          >
            {LABELS[s]} <span className="ml-1 text-[10px] text-zinc-500">{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>
      <ListGrid entries={filtered} />
    </div>
  );
}
