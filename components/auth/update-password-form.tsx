"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePathzyLanguage } from "@/components/language/language-selector";
import { pathzyPhase2T } from "@/lib/language/pathzy-i18n";
import { PATHZY_ROUTES } from "@/lib/navigation/routes";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const { language } = usePathzyLanguage();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function updatePassword(formData: FormData) {
    setLoading(true);
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const password = String(formData.get("password") || "");
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.replace(PATHZY_ROUTES.HOME);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : pathzyPhase2T(language, "auth.update.failure"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={updatePassword}>
      <label className="label">{pathzyPhase2T(language, "auth.update.password")}<input className="field" name="password" type="password" minLength={8} placeholder={pathzyPhase2T(language, "auth.update.placeholder")} required disabled={!isSupabaseConfigured()} /></label>
      {message ? <p className="mt-4 rounded-[18px] border border-white/10 bg-white/7 p-3 text-sm font-bold text-white/70">{message}</p> : null}
      <button disabled={loading || !isSupabaseConfigured()} className="mt-6 w-full rounded-full blue-purple px-6 py-4 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? pathzyPhase2T(language, "auth.update.saving") : pathzyPhase2T(language, "auth.update.submit")}
      </button>
    </form>
  );
}
