"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ClaimFounderButton({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function claim() {
    if (disabled || loading) return;
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/launch-membership", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "Could not claim your Founder spot yet.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not claim your Founder spot yet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={claim}
        disabled={disabled || loading}
        className="tap-target rounded-full blue-purple px-7 py-4 text-sm font-extrabold text-white shadow-[0_16px_42px_rgba(91,140,255,.32)] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {disabled ? "Join Waiting List" : loading ? "Claiming..." : "Claim Founder Spot"}
      </button>
      {message ? <p className="rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm font-bold text-[#ffc5c5]">{message}</p> : null}
    </div>
  );
}
