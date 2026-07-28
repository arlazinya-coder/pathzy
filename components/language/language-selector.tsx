"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { pathzyPhase2T } from "@/lib/language/pathzy-i18n";
import { interfaceLanguageCookieName, languageLabels, normalizeLanguageCode, profileLanguagePatchForInterface, type SupportedLanguageCode } from "@/lib/language/language-preferences";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const publicLanguageStorageKey = "pathzy:interface-language";
export const publicLanguageCookieName = interfaceLanguageCookieName;
export const languageChangedEventName = "pathzy-language-changed";

type PathzyLanguageContextValue = {
  language: SupportedLanguageCode;
  setLanguage: (nextLanguage: SupportedLanguageCode) => void;
};

const PathzyLanguageContext = createContext<PathzyLanguageContextValue | null>(null);

function persistPublicLanguage(language: SupportedLanguageCode) {
  window.localStorage.setItem(publicLanguageStorageKey, language);
  document.cookie = `${publicLanguageCookieName}=${language}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = language;
  window.dispatchEvent(new CustomEvent(languageChangedEventName, { detail: { language } }));
}

function useStandalonePathzyLanguage(initialLanguage?: string | null, enabled = true) {
  const [language, setLanguageState] = useState<SupportedLanguageCode>(() => normalizeLanguageCode(initialLanguage));

  useEffect(() => {
    if (!enabled) return;
    persistPublicLanguage(language);
  }, [enabled, language]);

  useEffect(() => {
    if (!enabled) return;
    function onLanguageChanged(event: Event) {
      const next = (event as CustomEvent<{ language?: string }>).detail?.language;
      if (next) setLanguageState(normalizeLanguageCode(next));
    }
    window.addEventListener(languageChangedEventName, onLanguageChanged);
    return () => window.removeEventListener(languageChangedEventName, onLanguageChanged);
  }, [enabled]);

  function setLanguage(nextLanguage: SupportedLanguageCode) {
    setLanguageState(nextLanguage);
    if (enabled) persistPublicLanguage(nextLanguage);
  }

  return { language, setLanguage };
}

export function PathzyLanguageProvider({
  children,
  initialLanguage
}: {
  children: React.ReactNode;
  initialLanguage?: string | null;
}) {
  const [language, setLanguageState] = useState<SupportedLanguageCode>(() => normalizeLanguageCode(initialLanguage));

  useEffect(() => {
    persistPublicLanguage(language);
  }, [language]);

  useEffect(() => {
    function onLanguageChanged(event: Event) {
      const next = (event as CustomEvent<{ language?: string }>).detail?.language;
      if (next) setLanguageState(normalizeLanguageCode(next));
    }
    window.addEventListener(languageChangedEventName, onLanguageChanged);
    return () => window.removeEventListener(languageChangedEventName, onLanguageChanged);
  }, []);

  function setLanguage(nextLanguage: SupportedLanguageCode) {
    setLanguageState(nextLanguage);
    persistPublicLanguage(nextLanguage);
  }

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return <PathzyLanguageContext.Provider value={value}>{children}</PathzyLanguageContext.Provider>;
}

export function usePathzyLanguage(initialLanguage?: string | null) {
  const context = useContext(PathzyLanguageContext);
  const standalone = useStandalonePathzyLanguage(initialLanguage, !context);
  return context ?? standalone;
}

export function LanguageSelector({
  initialLanguage,
  persistAuthenticated = true,
  label = "Interface language"
}: {
  initialLanguage?: string | null;
  persistAuthenticated?: boolean;
  label?: string;
}) {
  const { language, setLanguage } = usePathzyLanguage(initialLanguage);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const accessibleLabel = label === "Interface language" ? pathzyPhase2T(language, "language.selector.label") : label;

  async function changeLanguage(nextLanguage: SupportedLanguageCode) {
    setLanguage(nextLanguage);
    setStatus("saving");
    try {
      if (!persistAuthenticated || !isSupabaseConfigured()) {
        setStatus("saved");
        return;
      }
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        setStatus("saved");
        return;
      }
      const { error } = await supabase.from("user_profiles").upsert(profileLanguagePatchForInterface(user.id, nextLanguage, user.email), { onConflict: "user_id" });
      setStatus(error ? "error" : "saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--pathzy-border)] bg-white p-1 shadow-[var(--pathzy-shadow-soft)]" aria-label={accessibleLabel}>
      {(["en", "fr"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => void changeLanguage(code)}
          aria-pressed={language === code}
          title={languageLabels[code]}
          className={`min-h-9 rounded-full px-3 text-xs font-bold uppercase tracking-[0.08em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pathzy-red)] ${
            language === code ? "bg-[var(--pathzy-red)] text-white" : "text-[var(--pathzy-slate)] hover:bg-[var(--pathzy-mist)] hover:text-[var(--pathzy-ink)]"
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
      <span className="sr-only" aria-live="polite">
        {status === "saving" ? pathzyPhase2T(language, "language.saving") : status === "saved" ? pathzyPhase2T(language, "language.saved") : status === "error" ? pathzyPhase2T(language, "language.error") : ""}
      </span>
    </div>
  );
}
