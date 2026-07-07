import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function AuthNotice() {
  if (isSupabaseConfigured()) return null;

  return (
    <div className="mb-5 rounded-[20px] border border-[#ffd166]/25 bg-[#ffd166]/10 p-4 text-sm font-bold leading-6 text-[#ffe3a3]">
      Something needs a quick setup before accounts can be used. Please ask the PATHZY team to finish setup, then refresh and try again. See{" "}
      <Link href="/settings" className="text-white underline underline-offset-4">
        Settings
      </Link>{" "}
      for setup guidance.
    </div>
  );
}
