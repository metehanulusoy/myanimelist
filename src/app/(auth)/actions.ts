"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const credSchema = z.object({
  email: z.string().email("Geçerli bir e-posta gir"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

const signUpSchema = credSchema.extend({
  username: z
    .string()
    .min(3, "Kullanıcı adı en az 3 karakter")
    .max(24, "En fazla 24 karakter")
    .regex(/^[a-z0-9_]+$/i, "Sadece harf, rakam ve alt çizgi"),
});

export type AuthState = { error?: string } | undefined;

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz giriş" };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };
  redirect("/me");
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz giriş" };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { username: parsed.data.username.toLowerCase() },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/me`,
    },
  });
  if (error) return { error: error.message };
  redirect("/me?welcome=1");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
