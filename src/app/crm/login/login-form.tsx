"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "../actions";

const field = "min-h-11 rounded-md border border-line bg-ink px-3 text-[15px] text-sand";
const label = "flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, { error: null });

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className={label}>
        Email
        <input name="email" type="email" autoComplete="username" required className={field} />
      </label>
      <label className={label}>
        Password
        <input name="password" type="password" autoComplete="current-password" required className={field} />
      </label>
      {state.error && (
        <p role="alert" className="text-sm font-semibold text-gold-light">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="min-h-12 rounded-md bg-gold font-bold text-ink hover:bg-gold-light disabled:opacity-70">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
