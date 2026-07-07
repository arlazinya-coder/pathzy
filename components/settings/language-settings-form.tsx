"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Language = "english" | "french";

function normalizeLanguage(value?: string | null): Language {
  return value === "french" ? "french" : "english";
}

export function LanguageSettingsForm({ initialLanguage }: { initialLanguage?: string | null }) {
  const [language, setLanguage] = useState<Language>(() => normalizeLanguage(initialLanguage));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    setSaving(true);
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("Please log in to update your language.");
        return;
      }

      const { error } = await supabase.from("user_profiles").upsert(
        {
          user_id: user.id,
          email: user.email,
          language: nextLanguage,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      );

      if (error) {
        console.error("[settings] language update failed", error);
        setMessage("We could not save your language yet. Please try again.");
        return;
      }

      setMessage("Language saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[18px] border border-white/10 bg-white/7 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">Language</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {[
          ["english", "English"],
          ["french", "Français"]
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            disabled={saving}
            onClick={() => void saveLanguage(value as Language)}
            className={`rounded-full border px-4 py-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              language === value ? "border-[#5B8CFF]/70 bg-[#5B8CFF]/18 text-white" : "border-white/10 bg-white/7 text-white/68 hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {message ? <p className="mt-3 text-sm font-bold text-white/58">{message}</p> : null}
    </div>
  );
}
