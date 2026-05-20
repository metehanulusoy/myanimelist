export type ListStatus =
  | "watching"
  | "completed"
  | "plan_to_watch"
  | "dropped"
  | "on_hold";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_public: boolean;
  xp: number;
  level: number;
  current_streak: number;
  created_at: string;
}

export interface AnimeCache {
  id: number;
  title: string;
  title_english: string | null;
  synopsis: string | null;
  cover_image_url: string | null;
  episodes: number | null;
  genres: string[] | null;
  studio: string | null;
  season: string | null;
  year: number | null;
  type: string | null;
  external_score: number | null;
  cached_at: string;
}

export interface ListEntry {
  id: string;
  user_id: string;
  anime_id: number;
  status: ListStatus;
  score: number | null;
  episodes_watched: number;
  notes: string | null;
  is_favorite: boolean;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListEntryWithAnime extends ListEntry {
  anime: AnimeCache;
}

export interface UserStats {
  user_id: string;
  username: string;
  total_entries: number;
  completed: number;
  watching: number;
  plan_to_watch: number;
  dropped: number;
  on_hold: number;
  total_episodes: number;
  average_score: number | null;
}

export const STATUS_LABELS: Record<ListStatus, string> = {
  watching: "İzliyorum",
  completed: "Bitirdim",
  plan_to_watch: "İzleyeceğim",
  dropped: "Bıraktım",
  on_hold: "Beklemede",
};
