import Link from "next/link";
import type { Profile, UserStats } from "@/lib/supabase/types";

export function ProfileHeader({
  profile,
  stats,
  isSelf,
}: {
  profile: Profile;
  stats: UserStats | null;
  isSelf: boolean;
}) {
  return (
    <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-transparent to-pink-500/10 p-6">
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 text-3xl font-bold text-white shadow-xl">
          {profile.username[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-sm text-zinc-400">@{profile.username}</p>
          {profile.bio ? (
            <p className="mt-2 max-w-prose text-sm text-zinc-300">{profile.bio}</p>
          ) : null}
        </div>
        {isSelf ? (
          <Link
            href="/settings"
            className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/5"
          >
            Profili düzenle
          </Link>
        ) : null}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Tamamlandı" value={stats?.completed ?? 0} />
        <Stat label="İzleniyor" value={stats?.watching ?? 0} />
        <Stat label="Planlanan" value={stats?.plan_to_watch ?? 0} />
        <Stat label="Toplam bölüm" value={stats?.total_episodes ?? 0} />
        <Stat
          label="Ortalama puan"
          value={stats?.average_score ? stats.average_score.toFixed(2) : "—"}
        />
      </dl>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <dt className="text-xs uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold">{value}</dd>
    </div>
  );
}
