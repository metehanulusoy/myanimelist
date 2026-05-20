"use client";

import { useActionState } from "react";
import type { Profile } from "@/lib/supabase/types";
import { updateProfile, type SettingsState } from "@/app/settings/actions";

export function SettingsForm({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    updateProfile,
    undefined
  );

  return (
    <form action={action} className="space-y-5">
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
        <span className="text-zinc-500">E-posta:</span>{" "}
        <span className="text-zinc-200">{email}</span>
        <p className="mt-1 text-xs text-zinc-500">
          E-posta adresi şimdilik değiştirilemez.
        </p>
      </div>

      <Field
        label="Kullanıcı adı"
        name="username"
        defaultValue={profile.username}
        required
        hint="3–24 karakter, sadece harf/rakam/alt çizgi. Profil URL'inde kullanılır."
      />

      <Field
        label="Görünen ad"
        name="display_name"
        defaultValue={profile.display_name ?? ""}
        placeholder={profile.username}
        hint="İsteğe bağlı. Boş bırakırsan kullanıcı adın görünür."
      />

      <label className="block">
        <span className="mb-1.5 block text-sm text-zinc-300">Hakkında</span>
        <textarea
          name="bio"
          rows={3}
          maxLength={280}
          defaultValue={profile.bio ?? ""}
          placeholder="Kendinden biraz bahset…"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm placeholder:text-zinc-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
        />
        <span className="mt-1 block text-xs text-zinc-500">
          En fazla 280 karakter.
        </span>
      </label>

      <Field
        label="Avatar URL"
        name="avatar_url"
        type="url"
        defaultValue={profile.avatar_url ?? ""}
        placeholder="https://..."
        hint="İsteğe bağlı. Bir görsel linki yapıştır (örn. imgur)."
      />

      <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <input
          type="checkbox"
          name="is_public"
          defaultChecked={profile.is_public}
          className="mt-0.5 h-4 w-4 accent-indigo-500"
        />
        <span className="block">
          <span className="text-sm font-medium text-zinc-100">
            Profilim herkese açık
          </span>
          <span className="mt-0.5 block text-xs text-zinc-400">
            Kapalıysa profil ve liste sayfan başkalarına 404 döner. Sen kendi
            sayfanı yine görürsün.
          </span>
        </span>
      </label>

      {state?.error ? (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          Kaydedildi.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-zinc-300">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm placeholder:text-zinc-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
      />
      {hint ? (
        <span className="mt-1 block text-xs text-zinc-500">{hint}</span>
      ) : null}
    </label>
  );
}
