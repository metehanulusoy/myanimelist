import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings-form";
import type { Profile } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil ayarları — AnimeVerse" };

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-zinc-300">Profilin bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Profil ayarları</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Görünen adın, biyografin ve gizlilik tercihini buradan değiştir.
      </p>
      <div className="mt-6">
        <SettingsForm profile={profile as Profile} email={user.email ?? ""} />
      </div>
    </div>
  );
}
