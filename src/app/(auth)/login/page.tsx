"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthState } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, undefined);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Giriş yap</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Listene erişmek için hesabına gir.
      </p>
      <form action={action} className="mt-8 space-y-4">
        <Field label="E-posta" name="email" type="email" autoComplete="email" required />
        <Field label="Şifre" name="password" type="password" autoComplete="current-password" required />
        {state?.error ? (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 disabled:opacity-60"
        >
          {pending ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-400">
        Hesabın yok mu?{" "}
        <Link href="/register" className="text-indigo-300 hover:text-indigo-200">
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-zinc-300">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
      />
    </label>
  );
}
