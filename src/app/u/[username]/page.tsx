import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profile-header";
import { StatusTabs } from "@/components/status-tabs";
import type { ListEntryWithAnime, Profile, UserStats } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .maybeSingle();

  // RLS gizli profilleri zaten gizler; null gelirse 404.
  if (!profile) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSelf = user?.id === profile.id;

  const [{ data: stats }, { data: entries }] = await Promise.all([
    supabase.from("user_stats").select("*").eq("user_id", profile.id).maybeSingle(),
    supabase
      .from("list_entries")
      .select("*, anime:anime_cache(*)")
      .eq("user_id", profile.id)
      .order("updated_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <ProfileHeader
        profile={profile as Profile}
        stats={(stats as UserStats | null) ?? null}
        isSelf={isSelf}
      />

      {!isSelf ? (
        <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-400">
          Bu profil <strong className="text-zinc-200">salt-okunur</strong> olarak gösteriliyor.
          Sadece sahibi listesini değiştirebilir.
        </p>
      ) : null}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Liste</h2>
        <StatusTabs entries={(entries as ListEntryWithAnime[]) ?? []} />
      </section>
    </div>
  );
}
