import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteNav } from "@/components/site-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AnimeVerse — Sosyal anime takip platformu",
  description:
    "Anime izleme listeni oluştur, puan ver, başkalarının listelerini keşfet. Görülebilir ama dokunulamaz.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <SiteNav />
          <main className="flex-1">{children}</main>
          <footer className="mt-12 border-t border-white/10 py-6 text-center text-xs text-zinc-500">
            AnimeVerse · Anime verisi{" "}
            <a className="underline hover:text-zinc-300" href="https://jikan.moe">
              Jikan API
            </a>{" "}
            üzerinden sağlanır.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
