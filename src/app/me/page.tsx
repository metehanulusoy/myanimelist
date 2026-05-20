import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profile-header";
import { StatusTabs } from "@/components/status-tabs";
import type { ListEntryWithAnime, Profile, UserStats } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function MePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: stats }, { data: entries }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("user_stats").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("list_entries")
      .select("*, anime:anime_cache(*)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-zinc-300">
          Profilin henüz hazır değil. Lütfen{" "}
          <Link href="/login" className="text-indigo-300 hover:text-indigo-200">
            yeniden giriş yap
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      {welcome ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Hoş geldin, @{profile.username}! E-posta doğrulaması açıksa kutunu kontrol et.
        </div>
      ) : null}

      <ProfileHeader
        profile={profile as Profile}
        stats={(stats as UserStats | null) ?? null}
        isSelf
      />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Listem</h2>
          <Link
            href="/search"
            className="text-sm text-indigo-300 hover:text-indigo-200"
          >
            Anime ekle →
          </Link>
        </div>
        <StatusTabs entries={(entries as ListEntryWithAnime[]) ?? []} />
      </section>
    </div>
  );
}
