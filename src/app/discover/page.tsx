import Image from "next/image";
import Link from "next/link";
import { Flame, Heart, Star } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Keşfet — AnimeVerse" };

interface PopularAnime {
  id: number;
  title: string;
  title_english: string | null;
  cover_image_url: string | null;
  episodes: number | null;
  type: string | null;
  year: number | null;
  total_entries: number;
  completed_count: number;
  watching_count: number;
  community_score: number | null;
  rated_count: number;
}

export default async function DiscoverPage() {
  const supabase = await createSupabaseServerClient();

  // 3 paralel sorgu
  const [trending, topRated, watchingNow] = await Promise.all([
    supabase
      .from("anime_popularity")
      .select("*")
      .gt("total_entries", 0)
      .order("total_entries", { ascending: false })
      .limit(12),
    supabase
      .from("anime_popularity")
      .select("*")
      .gte("rated_count", 3)
      .order("community_score", { ascending: false, nullsFirst: false })
      .limit(12),
    supabase
      .from("anime_popularity")
      .select("*")
      .gt("watching_count", 0)
      .order("watching_count", { ascending: false })
      .limit(12),
  ]);

  const trendingList = (trending.data as PopularAnime[] | null) ?? [];
  const topRatedList = (topRated.data as PopularAnime[] | null) ?? [];
  const watchingList = (watchingNow.data as PopularAnime[] | null) ?? [];

  const allEmpty =
    trendingList.length === 0 &&
    topRatedList.length === 0 &&
    watchingList.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Keşfet</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Toplulukta neler izleniyor? En çok eklenenler, en yüksek puanlılar ve şu an
          izlenenler.
        </p>
      </header>

      {allEmpty ? (
        <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-400">
          Topluluk henüz veri toplamadı. İlk animeni{" "}
          <Link href="/search" className="text-indigo-300 hover:text-indigo-200">
            buradan ekle
          </Link>{" "}
          ve sıralamada gözükmeye başla.
        </p>
      ) : (
        <div className="space-y-12">
          <Section
            title="En çok eklenen"
            icon={<Flame className="h-5 w-5 text-orange-300" />}
            description="Toplulukta en çok listeye eklenen animeler"
            list={trendingList}
            metric={(a) => `${a.total_entries} kişi`}
          />
          <Section
            title="Topluluk favorileri"
            icon={<Star className="h-5 w-5 text-amber-300" />}
            description="En yüksek topluluk puanına sahip (en az 3 oy)"
            list={topRatedList}
            metric={(a) =>
              a.community_score !== null
                ? `★ ${Number(a.community_score).toFixed(2)} (${a.rated_count})`
                : "—"
            }
          />
          <Section
            title="Şu an izleniyor"
            icon={<Heart className="h-5 w-5 text-pink-300" />}
            description='Hâlâ "İzliyorum" durumunda olanlar'
            list={watchingList}
            metric={(a) => `${a.watching_count} izliyor`}
          />
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  description,
  list,
  metric,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
  list: PopularAnime[];
  metric: (a: PopularAnime) => string;
}) {
  if (list.length === 0) return null;
  return (
    <section>
      <header className="mb-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          {icon} {title}
        </h2>
        <p className="text-xs text-zinc-500">{description}</p>
      </header>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {list.map((a) => (
          <li key={a.id}>
            <Link
              href={`/anime/${a.id}`}
              className="group block overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-indigo-400/40 hover:bg-white/10"
            >
              <div className="relative aspect-[2/3] w-full bg-black/20">
                {a.cover_image_url ? (
                  <Image
                    src={a.cover_image_url}
                    alt={a.title}
                    fill
                    sizes="(max-width: 768px) 33vw, 200px"
                    className="object-cover transition group-hover:scale-[1.03]"
                  />
                ) : null}
                <span className="absolute right-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-amber-200">
                  {metric(a)}
                </span>
              </div>
              <div className="p-2.5">
                <p className="line-clamp-2 text-sm font-medium text-zinc-100">
                  {a.title}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {a.type ?? "—"}
                  {a.year ? ` · ${a.year}` : ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
