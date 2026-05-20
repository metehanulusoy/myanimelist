import Image from "next/image";
import Link from "next/link";
import { Crown, Film, Star, Tv } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sıralama — AnimeVerse" };

interface Row {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  completed_count: number;
  total_episodes: number;
  average_score: number | null;
  rated_count: number;
  total_entries: number;
}

type Tab = "completed" | "episodes" | "score";

const TABS: { key: Tab; label: string; icon: React.ReactNode; metric: string }[] = [
  { key: "completed", label: "En çok bitiren", icon: <Tv className="h-4 w-4" />, metric: "anime" },
  { key: "episodes", label: "En çok bölüm", icon: <Film className="h-4 w-4" />, metric: "bölüm" },
  { key: "score", label: "En yüksek puan", icon: <Star className="h-4 w-4" />, metric: "ortalama" },
];

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: Tab }>;
}) {
  const { tab = "completed" } = await searchParams;
  const activeTab: Tab = TABS.some((t) => t.key === tab) ? tab : "completed";

  const supabase = await createSupabaseServerClient();

  // Order alanını tab'a göre belirle
  const orderColumn =
    activeTab === "episodes"
      ? "total_episodes"
      : activeTab === "score"
        ? "average_score"
        : "completed_count";

  let query = supabase
    .from("leaderboard")
    .select("*")
    .order(orderColumn, { ascending: false, nullsFirst: false })
    .limit(50);

  // Puan sıralamasında en az 5 puanı olanları al, anlamlı olsun
  if (activeTab === "score") {
    query = query.gte("rated_count", 5);
  } else {
    query = query.gt("total_entries", 0);
  }

  const { data: rows } = await query;
  const list = (rows as Row[] | null) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Crown className="h-7 w-7 text-amber-300" /> Sıralama
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Toplulukta en aktif izleyiciler. Sadece herkese açık profiller listelenir.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/leaderboard?tab=${t.key}`}
            className={
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition " +
              (t.key === activeTab
                ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-100"
                : "border-white/10 text-zinc-400 hover:text-zinc-200")
            }
          >
            {t.icon} {t.label}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
          Henüz bu kategori için yeterli veri yok. Listene anime ekleyince burada çıkacaksın.
        </p>
      ) : (
        <ol className="space-y-2">
          {list.map((row, i) => {
            const value =
              activeTab === "episodes"
                ? row.total_episodes
                : activeTab === "score"
                  ? row.average_score
                  : row.completed_count;
            const tabMeta = TABS.find((t) => t.key === activeTab)!;
            return (
              <li key={row.user_id}>
                <Link
                  href={`/u/${row.username}`}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 transition hover:border-indigo-400/40 hover:bg-white/10"
                >
                  <span
                    className={
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold " +
                      (i === 0
                        ? "bg-amber-400/20 text-amber-200"
                        : i === 1
                          ? "bg-zinc-300/20 text-zinc-200"
                          : i === 2
                            ? "bg-orange-400/20 text-orange-200"
                            : "bg-white/5 text-zinc-400")
                    }
                  >
                    {i + 1}
                  </span>

                  {row.avatar_url ? (
                    <Image
                      src={row.avatar_url}
                      alt={row.username}
                      width={36}
                      height={36}
                      unoptimized
                      className="h-9 w-9 rounded-full border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 text-sm font-bold text-white">
                      {row.username[0]?.toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-100">
                      {row.display_name || row.username}
                    </p>
                    <p className="truncate text-xs text-zinc-400">@{row.username}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold tabular-nums text-zinc-100">
                      {activeTab === "score" && value !== null
                        ? Number(value).toFixed(2)
                        : value ?? "—"}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                      {tabMeta.metric}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
