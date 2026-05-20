import Link from "next/link";
import { ArrowRight, Eye, Flame, ShieldCheck, Sparkles } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AnimeSearch } from "@/components/anime-search";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-16 sm:py-24">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-indigo-200">
          <Sparkles className="h-3.5 w-3.5" /> Sosyal anime takip platformu
        </p>
        <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Listeni oluştur.{" "}
          <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
            Diğerlerini keşfet.
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-300">
          AnimeVerse, izlediğin animeyi, puanını ve ilerlemeni takip etmeni sağlayan
          modern bir platform. Herkesin listesi <strong>görünür</strong>, ama yalnızca
          sahibi düzenleyebilir.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {user ? (
            <Link
              href="/me"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-400"
            >
              Listeme git <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-400"
            >
              Hemen başla <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-zinc-100 hover:bg-white/10"
          >
            Anime ara
          </Link>
        </div>
      </section>

      <section className="mb-16 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Hızlı arama
        </h2>
        <AnimeSearch />
      </section>

      <section className="mb-20 grid gap-4 sm:grid-cols-3">
        <Feature
          icon={<Eye className="h-5 w-5" />}
          title="Görülebilir"
          body="Her kullanıcının listesi varsayılan olarak herkese açık. Profil linkini paylaş, izlediklerini göster."
        />
        <Feature
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Dokunulamaz"
          body="Listene yalnızca sen yazabilirsin. RLS politikaları veritabanı seviyesinde garanti eder."
        />
        <Feature
          icon={<Flame className="h-5 w-5" />}
          title="Oyunlaştırılmış"
          body="İzleme serisi, XP ve rozet sistemleri ile alışkanlığını koru. (Yakında!)"
        />
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-200">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{body}</p>
    </div>
  );
}
