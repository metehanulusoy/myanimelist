-- AnimeVerse veritabanı şeması
-- Supabase SQL editöründe sırayla çalıştırın.
-- "Görülebilir ama dokunulamaz" ilkesi RLS politikaları ile zorunlu kılınır.

-- =========================================================
-- 0) EKLENTİLER
-- =========================================================
-- Arama performansı için trigram benzerlik indeksi (anime_cache.title üzerinde).
create extension if not exists pg_trgm;

-- =========================================================
-- 1) ENUM TİPLERİ
-- =========================================================
do $$ begin
  create type list_status as enum ('watching', 'completed', 'plan_to_watch', 'dropped', 'on_hold');
exception when duplicate_object then null; end $$;

-- =========================================================
-- 2) profiles  (auth.users tablosunu genişletir)
-- =========================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  display_name  text,
  avatar_url    text,
  bio           text,
  is_public     boolean not null default true,
  xp            integer not null default 0,
  level         integer not null default 1,
  current_streak integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (lower(username));

-- =========================================================
-- 3) anime_cache  (harici API'dan gelen metadata önbelleği)
-- =========================================================
create table if not exists public.anime_cache (
  id              bigint primary key,                 -- MAL ID
  title           text not null,
  title_english   text,
  synopsis        text,
  cover_image_url text,
  episodes        integer,
  genres          text[] default '{}',
  studio          text,
  season          text,
  year            integer,
  type            text,
  external_score  numeric(4,2),
  cached_at       timestamptz not null default now()
);

create index if not exists anime_cache_title_trgm_idx on public.anime_cache using gin (title gin_trgm_ops);

-- =========================================================
-- 4) list_entries  (kullanıcı liste kayıtları — kalbi burası)
-- =========================================================
create table if not exists public.list_entries (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  anime_id          bigint not null references public.anime_cache(id) on delete cascade,
  status            list_status not null default 'plan_to_watch',
  score             integer check (score between 1 and 10),
  episodes_watched  integer not null default 0,
  notes             text,
  is_favorite       boolean not null default false,
  started_at        date,
  finished_at       date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id, anime_id)
);

create index if not exists list_entries_user_idx on public.list_entries (user_id);
create index if not exists list_entries_anime_idx on public.list_entries (anime_id);

-- updated_at otomatik güncelleyici
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_list_entries_touch on public.list_entries;
create trigger trg_list_entries_touch
  before update on public.list_entries
  for each row execute function public.touch_updated_at();

-- =========================================================
-- 5) follows (sosyal — v1)
-- =========================================================
create table if not exists public.follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- =========================================================
-- 6) Yeni kullanıcı için profil otomatik oluştur
-- =========================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username text;
  candidate     text;
  suffix        integer := 0;
begin
  base_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1),
    'user_' || substr(new.id::text, 1, 8)
  );
  base_username := lower(regexp_replace(base_username, '[^a-z0-9_]+', '', 'g'));
  if base_username = '' then
    base_username := 'user_' || substr(new.id::text, 1, 8);
  end if;

  candidate := base_username;
  while exists (select 1 from public.profiles where username = candidate) loop
    suffix := suffix + 1;
    candidate := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (new.id, candidate, coalesce(new.raw_user_meta_data->>'display_name', candidate));

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- 7) ROW LEVEL SECURITY — "görülebilir ama dokunulamaz"
-- =========================================================

-- profiles ------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
  on public.profiles for select
  using (is_public = true or auth.uid() = id);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- anime_cache (herkes okur, hiç kimse client'tan yazmaz) --
alter table public.anime_cache enable row level security;

drop policy if exists "anime_cache_select_all" on public.anime_cache;
create policy "anime_cache_select_all"
  on public.anime_cache for select
  using (true);
-- INSERT/UPDATE yetkisi yalnızca service_role'da (RLS bypass) olur;
-- bu sayede yalnızca sunucu kodumuz cache'i yazabilir.

-- list_entries -------------------------------------------
alter table public.list_entries enable row level security;

drop policy if exists "list_entries_select_public" on public.list_entries;
create policy "list_entries_select_public"
  on public.list_entries for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = list_entries.user_id and p.is_public = true
    )
  );

drop policy if exists "list_entries_insert_self" on public.list_entries;
create policy "list_entries_insert_self"
  on public.list_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "list_entries_update_self" on public.list_entries;
create policy "list_entries_update_self"
  on public.list_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "list_entries_delete_self" on public.list_entries;
create policy "list_entries_delete_self"
  on public.list_entries for delete
  using (auth.uid() = user_id);

-- follows ------------------------------------------------
alter table public.follows enable row level security;

drop policy if exists "follows_select_all" on public.follows;
create policy "follows_select_all"
  on public.follows for select
  using (true);

drop policy if exists "follows_insert_self" on public.follows;
create policy "follows_insert_self"
  on public.follows for insert
  with check (auth.uid() = follower_id);

drop policy if exists "follows_delete_self" on public.follows;
create policy "follows_delete_self"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- =========================================================
-- 8) İstatistik için yardımcı görünüm (opsiyonel)
-- =========================================================
create or replace view public.user_stats as
select
  p.id                                            as user_id,
  p.username,
  count(le.*)                                     as total_entries,
  count(*) filter (where le.status = 'completed') as completed,
  count(*) filter (where le.status = 'watching')  as watching,
  count(*) filter (where le.status = 'plan_to_watch') as plan_to_watch,
  count(*) filter (where le.status = 'dropped')   as dropped,
  count(*) filter (where le.status = 'on_hold')   as on_hold,
  coalesce(sum(le.episodes_watched), 0)           as total_episodes,
  round(avg(le.score) filter (where le.score is not null)::numeric, 2) as average_score
from public.profiles p
left join public.list_entries le on le.user_id = p.id
group by p.id, p.username;
