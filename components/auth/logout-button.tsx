"use client";

import { appRoutes } from "@/lib/navigation/routes";
import { usePathzyLanguage } from "@/components/language/language-selector";
import { pathzyPhase2T } from "@/lib/language/pathzy-i18n";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function LogoutButton() {
  const { language } = usePathzyLanguage();

  async function logout() {
    if (!isSupabaseConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.replace(appRoutes.login);
  }

  return (
    <button onClick={logout} className="hidden rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#6B7280] shadow-sm transition hover:border-[#cbd5e1] hover:text-[#111827] sm:inline-flex">
      {pathzyPhase2T(language, "auth.logout")}
    </button>
  );
}
