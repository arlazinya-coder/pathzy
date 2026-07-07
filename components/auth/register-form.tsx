"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

const statusOptions = [
  { value: "student", label: "Student" },
  { value: "graduate", label: "Graduate" },
  { value: "unemployed", label: "Unemployed" },
  { value: "employed", label: "Employed" },
  { value: "entrepreneur", label: "Entrepreneur" },
  { value: "career_changer", label: "Career changer" },
  { value: "looking_first_job", label: "Looking for first job" }
] as const;

function friendlySignupError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already")) return "This email already has a PATHZY account. Please log in instead.";
  if (lower.includes("password")) return "Your password must be at least 8 characters.";
  if (lower.includes("network") || lower.includes("fetch")) return "Network error. Check your connection and try again.";
  return message || "We could not create your account. Please try again.";
}

export function RegisterForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData(event.currentTarget);
      const supabase = createSupabaseBrowserClient();
      const fullName = String(formData.get("full_name") || "");
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");
      const country = String(formData.get("country") || "");
      const ageValue = String(formData.get("age") || "");
      const education = String(formData.get("education") || "");
      const currentStatus = String(formData.get("current_status") || "");
      const age = ageValue ? Number(ageValue) : null;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          data: {
            full_name: fullName,
            country,
            age,
            education,
            current_status: currentStatus
          }
        }
      });

      if (error) {
        setMessage(friendlySignupError(error.message));
        return;
      }

      if (data.user && data.session) {
        await supabase.from("user_profiles").upsert({
          id: data.user.id,
          user_id: data.user.id,
          full_name: fullName,
          email,
          country,
          age,
          education,
          current_status: currentStatus,
          premium_status: "free",
          plan: "free",
          mentor_messages_today: 0,
          mentor_messages_date: new Date().toISOString().slice(0, 10)
        }, { onConflict: "user_id" });
        await fetch("/api/auth/bootstrap", { method: "POST" });
      }

      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
      } else {
        setMessage("Check your email to confirm your account.");
      }
    } catch (error) {
      setMessage(friendlySignupError(error instanceof Error ? error.message : "Unable to create account."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={register}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="label md:col-span-2">Full name<input className="field" name="full_name" placeholder="Your name" required disabled={!isSupabaseConfigured()} /></label>
        <label className="label">Email<input className="field" name="email" type="email" placeholder="you@example.com" required disabled={!isSupabaseConfigured()} /></label>
        <label className="label">Password<input className="field" name="password" type="password" placeholder="Create a password" minLength={8} required disabled={!isSupabaseConfigured()} /></label>
        <label className="label">Country<input className="field" name="country" placeholder="South Africa" disabled={!isSupabaseConfigured()} /></label>
        <label className="label">Age<input className="field" name="age" type="number" min="16" max="80" placeholder="35" disabled={!isSupabaseConfigured()} /></label>
        <label className="label">Education<input className="field" name="education" placeholder="University student" disabled={!isSupabaseConfigured()} /></label>
        <label className="label">
          Current status
          <select className="field" name="current_status" defaultValue="student" disabled={!isSupabaseConfigured()}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      {message ? <p className="mt-4 rounded-[18px] border border-white/10 bg-white/7 p-3 text-sm font-bold text-white/70">{message}</p> : null}
      <button type="submit" disabled={loading || !isSupabaseConfigured()} className="mt-6 w-full rounded-full blue-purple px-6 py-4 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? "Creating..." : "Start Free"}
      </button>
      <p className="mt-5 text-center text-sm text-white/58">Already have an account? <Link className="font-bold text-white" href="/login">Login</Link></p>
    </form>
  );
}
