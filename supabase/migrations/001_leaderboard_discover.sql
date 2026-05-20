-- Migration 001: Leaderboard + Discover view'ları
-- Supabase SQL editöründe tek seferde çalıştır.
-- Bu dosya idempotent — birden çok kez çalıştırılabilir.

-- =========================================================
-- Leaderboard view: yalnızca herkese açık profilleri toplar
-- =========================================================
create or replace view public.leaderboard as
select
  p.id                                                  as user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  count(*) filter (where le.status = 'completed')       as completed_count,
  coalesce(sum(le.episodes_watched), 0)::int            as total_episodes,
  round(avg(le.score) filter (where le.score is not null)::numeric, 2) as average_score,
  count(le.score) filter (where le.score is not null)::int as rated_count,
  count(le.*)                                           as total_entries
from public.profiles p
left join public.list_entries le on le.user_id = p.id
where p.is_public = true
group by p.id;

-- =========================================================
-- Anime popülerlik view: anime_cache + topluluk istatistikleri
-- =========================================================
create or replace view public.anime_popularity as
select
  a.id,
  a.title,
  a.title_english,
  a.cover_image_url,
  a.episodes,
  a.type,
  a.year,
  a.season,
  a.external_score,
  count(le.*)                                                    as total_entries,
  count(*) filter (where le.status = 'completed')                as completed_count,
  count(*) filter (where le.status = 'watching')                 as watching_count,
  count(*) filter (where le.status = 'plan_to_watch')            as plan_count,
  round(avg(le.score) filter (where le.score is not null)::numeric, 2) as community_score,
  count(le.score) filter (where le.score is not null)::int        as rated_count
from public.anime_cache a
left join public.list_entries le on le.anime_id = a.id
group by a.id;

-- Not: View'lar SECURITY INVOKER (varsayılan) ile çalışır.
-- Yani altta yatan tabloların RLS politikaları uygulanır:
-- * leaderboard yalnızca is_public = true profilleri sayar.
-- * anime_popularity'de list_entries RLS'i SELECT'i
--   "kendi VEYA public profil sahibi" satırlara kısıtladığı için
--   gizli profillerdeki kayıtlar agregasyona dahil olmaz.
