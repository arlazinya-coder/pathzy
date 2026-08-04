"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EmploymentHomeViewModel, EmploymentIntelligenceLanguage } from "@/lib/employment-intelligence/client";
import { requestEmploymentIntelligenceRecompute, retryEmploymentIntelligence } from "@/lib/employment-intelligence/client";

export function IntelligenceFreshnessPanel({ model, language }: { model: EmploymentHomeViewModel; language: EmploymentIntelligenceLanguage }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const shouldOfferUpdate = model.status === "stale" || model.status === "not_generated" || model.status === "failed";

  async function update() {
    setPending(true);
    setError("");
    try {
      if (model.status === "failed") await retryEmploymentIntelligence();
      else await requestEmploymentIntelligenceRecompute();
      router.refresh();
    } catch {
      setError(language === "fr" ? "PATHZY n'a pas pu mettre à jour vos informations. Vos résultats précédents restent disponibles." : "PATHZY could not update your insights. Your previous results are still available.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-live="polite" className="rounded-[24px] border border-white/10 bg-white/7 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black text-white">{model.freshnessLabel}</p>
          <p className="mt-1 text-sm leading-6 text-white/62">{model.freshnessDescription}</p>
          {model.updatedAtLabel ? <p className="mt-1 text-xs font-bold text-white/42">{model.updatedAtLabel}</p> : null}
        </div>
        {shouldOfferUpdate ? (
          <button type="button" disabled={pending} onClick={() => void update()} className="tap-target min-h-12 rounded-full blue-purple px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50">
            {pending ? (language === "fr" ? "Mise à jour..." : "Updating...") : (language === "fr" ? "Mettre à jour" : "Update insights")}
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-3 rounded-2xl border border-[#fca5a5]/30 bg-[#7f1d1d]/25 p-3 text-sm font-bold text-[#fecaca]" role="alert">{error}</p> : null}
    </section>
  );
}
