# AnimeVerse

Sosyal anime takip platformu — MAL tarzı, ama modern. Kullanıcılar kendi listelerini oluşturur, başkalarının listelerini görür ama düzenleyemez. "Görülebilir ama dokunulamaz" ilkesi, PostgreSQL **Row-Level Security** politikaları ile veritabanı seviyesinde garanti altına alınır.

Teknik araştırma raporu için bkz. [`../AnimeVerse-Teknik-Arastirma-Raporu.md`](../AnimeVerse-Teknik-Arastirma-Raporu.md).

## Yığın

- **Next.js 16** (App Router, Turbopack, RSC, `proxy.ts`)
- **React 19**
- **Tailwind CSS v4**
- **Supabase** (PostgreSQL + Auth + RLS) — `@supabase/ssr`
- **TanStack Query** — istemci tarafı önbellek
- **Jikan API v4** — anime metadata
- **Zod** — şema doğrulama
- **lucide-react** — ikonlar

## Kurulum

### 1) Supabase projesi

1. [supabase.com](https://supabase.com) üzerinden ücretsiz bir proje aç.
2. **SQL Editor**'ı aç, `supabase/schema.sql` içindeki SQL'i çalıştır.
   - Tabloları, RLS politikalarını ve yeni kullanıcı için profil oluşturan trigger'ı kurar.
   - `anime_cache.title` üzerindeki trigram indeksini istersen yorum satırı yap.
3. **Authentication → Providers**'tan e-posta sağlayıcısını aktif et (Google istersen oraya da ekle).

### 2) Ortam değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyala ve doldur:

```bash
cp .env.example .env.local
```

| Değişken | Nereden alınır |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (sadece sunucuda kullanılır, gizli!) |
| `NEXT_PUBLIC_SITE_URL` | Yerelde `http://localhost:3000`; üretimde alan adın |

### 3) Çalıştır

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini aç.

## Dosya yapısı

```
src/
├── app/
│   ├── (auth)/
│   │   ├── actions.ts           # signIn / signUp / signOut server actions
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── anime/[id]/
│   │   ├── actions.ts           # upsert / remove list_entries (RLS korumalı)
│   │   └── page.tsx             # anime detay (server) + form (client)
│   ├── api/anime/search/route.ts # Jikan proxy + 6 saatlik cache
│   ├── me/page.tsx              # kişisel profil + liste
│   ├── search/page.tsx          # anime arama
│   ├── u/[username]/page.tsx    # salt-okunur kullanıcı profili
│   ├── layout.tsx
│   └── page.tsx                 # ana sayfa
├── components/
│   ├── anime-search.tsx         # debounce'lu canlı arama
│   ├── list-entry-form.tsx      # durum / puan / bölüm formu
│   ├── list-grid.tsx
│   ├── profile-header.tsx
│   ├── providers.tsx            # TanStack Query
│   ├── site-nav.tsx
│   └── status-tabs.tsx
├── lib/
│   ├── anime-cache.ts           # getOrFetchAnime() — DB cache + Jikan fallback
│   ├── jikan.ts
│   ├── supabase/
│   │   ├── client.ts            # browser
│   │   ├── server.ts            # server component + service role
│   │   ├── proxy.ts             # Next 16 proxy (eski middleware)
│   │   └── types.ts
│   └── utils.ts
└── proxy.ts                     # Next.js 16: oturum çerez tazeleme (eski middleware.ts)
supabase/
└── schema.sql                   # tablolar + RLS politikaları + trigger'lar
```

## Mimari notları

- **İki veri dünyası**: `anime_cache` (ortak metadata, harici API'dan gelir) ile `list_entries` (kullanıcıya özel, RLS korumalı) açıkça ayrılır.
- **RLS**: `list_entries` üzerinde SELECT herkese açıktır (`profiles.is_public` kontrolü ile), INSERT/UPDATE/DELETE sadece `auth.uid() = user_id` ise mümkün. Bu yüzden uygulama kodu hatalı yazılsa bile başkasının listesi düzenlenemez.
- **Anime cache yazımı**: `service_role` anahtarı ile yapılır (anon rolüne `anime_cache.insert` yetkisi yoktur). Anahtar yalnızca sunucu yardımcılarında okunur.
- **Jikan rate limit** (~60 ist/dk): API route'ta `next: { revalidate: 21600 }` ile 6 saatlik ISR ve `anime_cache` DB'de 7 günlük tazelik kontrolü.
- **Auth oturum tazeleme**: `src/proxy.ts` her istekte Supabase çerezini günceller. Next.js 16'da `middleware` → `proxy` yeniden adlandırması nedeniyle bu konvansiyon kullanılır.

## Sırada ne var?

- Oyunlaştırma katmanı: XP / seviye / izleme serisi / rozet trigger'ları (rapor §12).
- Sosyal: `follows` UI, aktivite akışı, beğeni/yorum.
- Paylaşılabilir kart (`@vercel/og` ile yıllık özet).
- Liste içe aktarma (MAL/AniList export dosyası).

## Komutlar

```bash
npm run dev      # geliştirme sunucusu
npm run build    # üretim build (Turbopack)
npm run start    # build sonrası üretim sunucusu
```
