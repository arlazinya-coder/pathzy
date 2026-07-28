"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { friendlyAuthError, logAuthDiagnostic } from "@/lib/auth/auth-form-errors";
import { usePathzyLanguage } from "@/components/language/language-selector";
import { pathzyT } from "@/lib/language/pathzy-i18n";
import { PATHZY_ROUTES } from "@/lib/navigation/routes";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const { language } = usePathzyLanguage();
  const t = (key: Parameters<typeof pathzyT>[1]) => pathzyT(language, key);
  const callbackMessage = searchParams?.get("message") || "";
  const redirectTo = searchParams?.get("redirectTo") || PATHZY_ROUTES.HOME;
  const [message, setMessage] = useState(callbackMessage);
  const [loading, setLoading] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData(event.currentTarget);
      const supabase = createSupabaseBrowserClient();
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");
      if (process.env.NODE_ENV === "development") console.info("[PATHZY auth] Starting email/password login");
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(friendlyAuthError(error, "login", language));
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage(t("auth.login.sessionMissing"));
        return;
      }

      const bootstrap = await fetch("/api/auth/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redirectTo })
      });
      if (!bootstrap.ok) {
        const data = await bootstrap.json().catch(() => ({}));
        setMessage(data.error ?? t("auth.login.setupError"));
        return;
      }
      const bootstrapData = await bootstrap.json().catch(() => ({}));
      const destination = typeof bootstrapData.redirectTo === "string" && bootstrapData.redirectTo.startsWith("/") ? bootstrapData.redirectTo : PATHZY_ROUTES.HOME;

      window.location.replace(destination);
    } catch (caught) {
      logAuthDiagnostic("login", caught);
      setMessage(friendlyAuthError(caught, "login", language));
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;
      if (process.env.NODE_ENV === "development") console.info("[PATHZY auth] Starting Google login");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(PATHZY_ROUTES.HOME)}`
        }
      });

      if (error) {
        setMessage(friendlyAuthError(error, "oauth", language));
        setLoading(false);
      }
    } catch (caught) {
      logAuthDiagnostic("oauth", caught);
      setMessage(friendlyAuthError(caught, "oauth", language));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={login}>
      <label className="label">
        {t("auth.login.email")}
        <input className="field" name="email" type="email" placeholder={t("auth.login.emailPlaceholder")} required disabled={!isSupabaseConfigured()} />
      </label>
      <label className="label mt-4">
        {t("auth.login.password")}
        <input className="field" name="password" type="password" placeholder={t("auth.login.passwordPlaceholder")} required disabled={!isSupabaseConfigured()} />
      </label>
      {message ? <p className="mt-4 rounded-[18px] border border-white/10 bg-white/7 p-3 text-sm font-bold text-white/70">{message}</p> : null}
      <button type="submit" disabled={loading || !isSupabaseConfigured()} className="mt-6 w-full rounded-full blue-purple px-6 py-4 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? t("auth.login.loading") : t("auth.login.submit")}
      </button>
      <button type="button" onClick={signInWithGoogle} disabled={loading || !isSupabaseConfigured()} className="mt-3 w-full rounded-full border border-white/12 bg-white/8 px-6 py-4 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-50">
        {t("auth.login.google")}
      </button>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-sm text-white/58">
        <Link className="font-bold text-white" href={PATHZY_ROUTES.FORGOT_PASSWORD}>{t("auth.login.forgot")}</Link>
        <span>{t("auth.login.signupPrompt")} <Link className="font-bold text-white" href={PATHZY_ROUTES.SIGNUP}>{t("auth.login.signupLink")}</Link></span>
      </div>
    </form>
  );
}
