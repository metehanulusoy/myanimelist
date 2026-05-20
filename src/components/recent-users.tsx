import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export async function RecentUsers() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(8);

  const users = (data as Pick<Profile, "id" | "username" | "display_name" | "avatar_url" | "created_at">[] | null) ?? [];
  if (users.length === 0) return null;

  return (
    <section className="mb-16 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          <Users className="h-4 w-4" /> Aramıza yeni katılanlar
        </h2>
        <Link href="/leaderboard" className="text-xs text-indigo-300 hover:text-indigo-200">
          Sıralamayı gör →
        </Link>
      </header>
      <ul className="flex flex-wrap gap-3">
        {users.map((u) => (
          <li key={u.id}>
            <Link
              href={`/u/${u.username}`}
              className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 transition hover:border-indigo-400/40 hover:bg-white/10"
              title={`@${u.username}`}
            >
              {u.avatar_url ? (
                <Image
                  src={u.avatar_url}
                  alt={u.username}
                  width={28}
                  height={28}
                  unoptimized
                  className="h-7 w-7 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 text-xs font-bold text-white">
                  {u.username[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-sm text-zinc-200 group-hover:text-white">
                {u.display_name || u.username}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
