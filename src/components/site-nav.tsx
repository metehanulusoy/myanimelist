import Link from "next/link";
import { Search, User } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";

export async function SiteNav() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    username = data?.username ?? null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0a14]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight"
        >
          <span className="bg-gradient-to-r from-indigo-300 to-pink-300 bg-clip-text text-transparent">
            AnimeVerse
          </span>
        </Link>

        <nav className="hidden gap-4 text-sm text-zinc-300 sm:flex">
          <Link href="/search" className="inline-flex items-center gap-1.5 hover:text-white">
            <Search className="h-4 w-4" /> Keşfet
          </Link>
          {user ? (
            <Link href="/me" className="inline-flex items-center gap-1.5 hover:text-white">
              <User className="h-4 w-4" /> Listem
            </Link>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              {username ? (
                <Link
                  href={`/u/${username}`}
                  className="hidden text-sm text-zinc-300 hover:text-white sm:inline"
                >
                  @{username}
                </Link>
              ) : null}
              <form action={signOut}>
                <button className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/5">
                  Çıkış
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/5"
              >
                Giriş
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-400"
              >
                Kayıt ol
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
