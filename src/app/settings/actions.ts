"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  display_name: z
    .string()
    .max(60, "Görünen ad en fazla 60 karakter")
    .optional()
    .transform((v) => v?.trim() || null),
  bio: z
    .string()
    .max(280, "Bio en fazla 280 karakter")
    .optional()
    .transform((v) => v?.trim() || null),
  avatar_url: z
    .string()
    .url("Geçerli bir URL gir")
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v !== "" ? v : null)),
  username: z
    .string()
    .min(3, "Kullanıcı adı en az 3 karakter")
    .max(24, "En fazla 24 karakter")
    .regex(/^[a-z0-9_]+$/i, "Sadece harf, rakam ve alt çizgi"),
  is_public: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
    .optional()
    .transform((v) => v === "on" || v === "true"),
});

export type SettingsState =
  | { error?: string; success?: boolean }
  | undefined;

export async function updateProfile(
  _: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz girdi" };
  }
  const { username, display_name, bio, avatar_url, is_public } = parsed.data;
  const normalizedUsername = username.toLowerCase();

  // Kullanıcı adı değiştiyse benzersizlik kontrolü
  const { data: current } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (current && current.username !== normalizedUsername) {
    const { data: clash } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", normalizedUsername)
      .maybeSingle();
    if (clash) return { error: "Bu kullanıcı adı alınmış" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username: normalizedUsername,
      display_name,
      bio,
      avatar_url,
      is_public,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/me");
  revalidatePath(`/u/${normalizedUsername}`);
  revalidatePath("/settings");
  return { success: true };
}
