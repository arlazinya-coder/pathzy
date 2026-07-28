"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathzyLanguage } from "@/components/language/language-selector";
import { pathzyPhase2T, pathzyT } from "@/lib/language/pathzy-i18n";
import { PATHZY_ROUTES } from "@/lib/navigation/routes";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const { language } = usePathzyLanguage();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function resetPassword(formData: FormData) {
    setLoading(true);
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const email = String(formData.get("email") || "");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${PATHZY_ROUTES.AUTH_CALLBACK}?next=${encodeURIComponent(PATHZY_ROUTES.RESET_PASSWORD)}`
      });

      setMessage(error ? error.message : pathzyPhase2T(language, "auth.reset.success"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : pathzyPhase2T(language, "auth.reset.failure"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={resetPassword}>
      <label className="label">{pathzyT(language, "auth.login.email")}<input className="field" name="email" type="email" placeholder={pathzyT(language, "auth.login.emailPlaceholder")} required disabled={!isSupabaseConfigured()} /></label>
      {message ? <p className="mt-4 rounded-[18px] border border-white/10 bg-white/7 p-3 text-sm font-bold text-white/70">{message}</p> : null}
      <button disabled={loading || !isSupabaseConfigured()} className="mt-6 w-full rounded-full blue-purple px-6 py-4 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? pathzyPhase2T(language, "auth.reset.sending") : pathzyPhase2T(language, "auth.reset.submit")}
      </button>
      <p className="mt-5 text-center text-sm text-white/58">{pathzyPhase2T(language, "auth.reset.remembered")} <Link className="font-bold text-white" href={PATHZY_ROUTES.LOGIN}>{pathzyT(language, "auth.login.submit")}</Link></p>
    </form>
  );
}
