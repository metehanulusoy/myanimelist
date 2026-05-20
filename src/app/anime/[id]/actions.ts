"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getOrFetchAnime } from "@/lib/anime-cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ListStatus } from "@/lib/supabase/types";

const STATUSES: ListStatus[] = [
  "watching",
  "completed",
  "plan_to_watch",
  "dropped",
  "on_hold",
];

const upsertSchema = z.object({
  anime_id: z.coerce.number().int().positive(),
  status: z.enum(STATUSES as [ListStatus, ...ListStatus[]]),
  score: z
    .union([z.literal(""), z.coerce.number().int().min(1).max(10)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  episodes_watched: z.coerce.number().int().min(0).default(0),
  notes: z.string().max(2000).optional().transform((v) => v?.trim() || null),
  is_favorite: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
    .optional()
    .transform((v) => v === "on" || v === "true"),
});

export async function upsertListEntry(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = upsertSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error("Geçersiz girdi: " + parsed.error.message);
  }
  const { anime_id, status, score, episodes_watched, notes, is_favorite } = parsed.data;

  // Cache'te kayıt yoksa Jikan'dan getir
  const anime = await getOrFetchAnime(anime_id);
  if (!anime) throw new Error("Anime bulunamadı");

  const { error } = await supabase.from("list_entries").upsert(
    {
      user_id: user.id,
      anime_id,
      status,
      score,
      episodes_watched,
      notes,
      is_favorite,
    },
    { onConflict: "user_id,anime_id" }
  );
  if (error) throw new Error(error.message);

  revalidatePath(`/anime/${anime_id}`);
  revalidatePath(`/me`);
}

export async function removeListEntry(formData: FormData) {
  const animeId = Number(formData.get("anime_id"));
  if (!Number.isFinite(animeId)) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("list_entries")
    .delete()
    .eq("user_id", user.id)
    .eq("anime_id", animeId);

  revalidatePath(`/anime/${animeId}`);
  revalidatePath(`/me`);
}
