"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PATHZY_ROUTES } from "@/lib/navigation/routes";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

function friendlyLoginError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("email not confirmed") || lower.includes("not confirmed")) return "Email not confirmed. Please open the confirmation email from PATHZY, then log in again.";
  if (lower.includes("invalid login credentials")) return "Wrong password or account not found. Check your email and password, then try again.";
  if (lower.includes("user not found") || lower.includes("not found")) return "Account not found. Create an account first, or check that the email is correct.";
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("failed to fetch")) return "Network error. Check your internet connection and try again.";
  return message || "We could not log you in. Please try again.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackMessage = searchParams?.get("message") || "";
  const redirectTo = searchParams?.get("redirectTo") || PATHZY_ROUTES.MY_EMPLOYMENT_JOURNEY;
  const [message, setMessage] = useState(callbackMessage);
  const [loading, setLoading] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData(event.currentTarget);
      const supabase = createSupabaseBrowserClient();
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");
      console.info("[PATHZY auth] Starting email/password login", { email });
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(friendlyLoginError(error.message));
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage("Login succeeded, but PATHZY could not read your session yet. Please refresh and try again.");
        return;
      }

      const bootstrap = await fetch("/api/auth/bootstrap", { method: "POST" });
      if (!bootstrap.ok) {
        const data = await bootstrap.json().catch(() => ({}));
        setMessage(data.error ?? "PATHZY is still setting up your profile. Please refresh or try again.");
        return;
      }

      router.replace(redirectTo.startsWith("/") ? redirectTo : PATHZY_ROUTES.MY_EMPLOYMENT_JOURNEY);
      router.refresh();
    } catch (error) {
      setMessage(friendlyLoginError(error instanceof Error ? error.message : "Unable to log in."));
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;
      console.info("[PATHZY auth] Starting Google login");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(PATHZY_ROUTES.MY_EMPLOYMENT_JOURNEY)}`
        }
      });

      if (error) setMessage(friendlyLoginError(error.message));
    } catch (error) {
      setMessage(friendlyLoginError(error instanceof Error ? error.message : "Unable to start Google sign in."));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={login}>
      <label className="label">
        Email
        <input className="field" name="email" type="email" placeholder="you@example.com" required disabled={!isSupabaseConfigured()} />
      </label>
      <label className="label mt-4">
        Password
        <input className="field" name="password" type="password" placeholder="Your password" required disabled={!isSupabaseConfigured()} />
      </label>
      {message ? <p className="mt-4 rounded-[18px] border border-white/10 bg-white/7 p-3 text-sm font-bold text-white/70">{message}</p> : null}
      <button type="submit" disabled={loading || !isSupabaseConfigured()} className="mt-6 w-full rounded-full blue-purple px-6 py-4 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? "Logging in..." : "Login"}
      </button>
      <button type="button" onClick={signInWithGoogle} disabled={loading || !isSupabaseConfigured()} className="mt-3 w-full rounded-full border border-white/12 bg-white/8 px-6 py-4 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-50">
        Continue with Google
      </button>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-sm text-white/58">
        <Link className="font-bold text-white" href="/auth/reset-password">Forgot password?</Link>
        <span>New to PATHZY? <Link className="font-bold text-white" href={PATHZY_ROUTES.SIGNUP}>Create an account</Link></span>
      </div>
    </form>
  );
}
