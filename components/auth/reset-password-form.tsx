"use client";

import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function resetPassword(formData: FormData) {
    setLoading(true);
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const email = String(formData.get("email") || "");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`
      });

      setMessage(error ? error.message : "Password reset link sent. Check your email.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={resetPassword}>
      <label className="label">Email<input className="field" name="email" type="email" placeholder="you@example.com" required disabled={!isSupabaseConfigured()} /></label>
      {message ? <p className="mt-4 rounded-[18px] border border-white/10 bg-white/7 p-3 text-sm font-bold text-white/70">{message}</p> : null}
      <button disabled={loading || !isSupabaseConfigured()} className="mt-6 w-full rounded-full blue-purple px-6 py-4 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
      <p className="mt-5 text-center text-sm text-white/58">Remembered it? <Link className="font-bold text-white" href="/login">Login</Link></p>
    </form>
  );
}
