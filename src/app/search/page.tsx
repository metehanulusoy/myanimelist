import { AnimeSearch } from "@/components/anime-search";

export const metadata = { title: "Keşfet — AnimeVerse" };

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Anime ara</h1>
      <p className="mt-1 text-sm text-zinc-400">
        MyAnimeList üzerinden binlerce anime arasında keşfet.
      </p>
      <div className="mt-6">
        <AnimeSearch autoFocus />
      </div>
    </div>
  );
}
