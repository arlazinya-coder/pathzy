"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { friendlyAuthError, logAuthDiagnostic } from "@/lib/auth/auth-form-errors";
import { usePathzyLanguage } from "@/components/language/language-selector";
import { pathzyT } from "@/lib/language/pathzy-i18n";
import { PATHZY_ROUTES, routeBuilders } from "@/lib/navigation/routes";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function RegisterForm() {
  const { language } = usePathzyLanguage();
  const t = (key: Parameters<typeof pathzyT>[1]) => pathzyT(language, key);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData(event.currentTarget);
      const supabase = createSupabaseBrowserClient();
      const fullName = String(formData.get("full_name") || "");
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");
      const welcomeDestination = routeBuilders.professionalIdentityWelcome();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(welcomeDestination)}`,
          data: {
            full_name: fullName,
            interface_language: language
          }
        }
      });

      if (error) {
        setMessage(friendlyAuthError(error, "signup", language));
        return;
      }

      if (data.user && data.session) {
        await supabase.from("user_profiles").upsert({
          id: data.user.id,
          user_id: data.user.id,
          full_name: fullName,
          email,
          premium_status: "free",
          plan: "free",
          mentor_messages_today: 0,
          mentor_messages_date: new Date().toISOString().slice(0, 10)
        }, { onConflict: "user_id" });
        const bootstrap = await fetch("/api/auth/bootstrap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ redirectTo: welcomeDestination })
        });
        if (!bootstrap.ok) {
          const payload = await bootstrap.json().catch(() => ({}));
          setMessage(typeof payload.error === "string" ? payload.error : t("auth.login.setupError"));
          return;
        }
        const payload = await bootstrap.json().catch(() => ({}));
        if (typeof payload.redirectTo === "string") {
          window.location.replace(payload.redirectTo);
          return;
        }
      }

      if (data.session) {
        window.location.replace(welcomeDestination);
      } else {
        setMessage(t("auth.signup.confirmEmail"));
      }
    } catch (caught) {
      logAuthDiagnostic("signup", caught);
      setMessage(friendlyAuthError(caught, "signup", language));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={register}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="label md:col-span-2">{t("auth.signup.fullName")}<input className="field" name="full_name" placeholder={t("auth.signup.fullNamePlaceholder")} required disabled={!isSupabaseConfigured()} /></label>
        <label className="label">{t("auth.signup.email")}<input className="field" name="email" type="email" placeholder={t("auth.signup.emailPlaceholder")} required disabled={!isSupabaseConfigured()} /></label>
        <label className="label">{t("auth.signup.password")}<input className="field" name="password" type="password" placeholder={t("auth.signup.passwordPlaceholder")} minLength={8} required disabled={!isSupabaseConfigured()} /></label>
      </div>
      {message ? <p className="mt-4 rounded-[18px] border border-white/10 bg-white/7 p-3 text-sm font-bold text-white/70">{message}</p> : null}
      <button type="submit" disabled={loading || !isSupabaseConfigured()} className="mt-6 w-full rounded-full blue-purple px-6 py-4 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? t("auth.signup.loading") : t("auth.signup.submit")}
      </button>
      <p className="mt-5 text-center text-sm text-white/58">{t("auth.signup.loginPrompt")} <Link className="font-bold text-white" href={PATHZY_ROUTES.LOGIN}>{t("auth.signup.loginLink")}</Link></p>
    </form>
  );
}
