"use client";

import { useRouter } from "next/navigation";
import { appRoutes } from "@/lib/navigation/routes";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    if (!isSupabaseConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace(appRoutes.login);
    router.refresh();
  }

  return (
    <button onClick={logout} className="hidden rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-bold text-white/70 transition hover:text-white sm:inline-flex">
      Logout
    </button>
  );
}
