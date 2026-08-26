"use client";

import Link from "next/link";
import { usePathzyLanguage } from "@/components/language/language-selector";
import { pathzyPhase2T } from "@/lib/language/pathzy-i18n";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function AuthNotice() {
  const { language } = usePathzyLanguage();

  if (isSupabaseConfigured()) return null;

  return (
    <div className="pathzy-status-warning mb-5 rounded-[20px] border p-4 text-sm font-bold leading-6">
      {pathzyPhase2T(language, "auth.notice.message")}{" "}
      <Link href="/settings" className="text-white underline underline-offset-4">
        {pathzyPhase2T(language, "auth.notice.settings")}
      </Link>{" "}
      {pathzyPhase2T(language, "auth.notice.after")}
    </div>
  );
}
