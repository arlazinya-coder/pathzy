"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SelectCareerButton({
  careerGoal,
  selected = false,
  label = "Choose This Career"
}: {
  careerGoal: string;
  selected?: boolean;
  label?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function selectCareer() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/career-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerGoal })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We could not save your career choice yet.");
      router.push(data.nextRoute ?? "/missions");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not save your career choice yet.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-5">
      <button type="button" onClick={selectCareer} disabled={saving || selected} className={`rounded-full px-5 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-80 ${selected ? "border border-[#66E3B4]/35 bg-[#66E3B4]/16 text-[#d8fff0]" : "blue-purple"}`}>
        {selected ? "Primary Career Goal" : saving ? "Saving choice" : label}
      </button>
      {error ? <p className="mt-3 text-sm font-bold text-[#ffc5c5]">{error}</p> : null}
    </div>
  );
}
