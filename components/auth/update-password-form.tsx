"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
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

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={updatePassword}>
      <label className="label">New password<input className="field" name="password" type="password" minLength={8} placeholder="Create a new password" required disabled={!isSupabaseConfigured()} /></label>
      {message ? <p className="mt-4 rounded-[18px] border border-white/10 bg-white/7 p-3 text-sm font-bold text-white/70">{message}</p> : null}
      <button disabled={loading || !isSupabaseConfigured()} className="mt-6 w-full rounded-full blue-purple px-6 py-4 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
