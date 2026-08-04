import Link from "next/link";
import { Card, ProgressBar } from "@/components/ui";
import type { EmploymentHomeViewModel, EmploymentIntelligenceLanguage } from "@/lib/employment-intelligence/client";

const copy = {
  en: { title: "Your employment position", strengths: "Strongest assets", barriers: "Main barriers", details: "Readiness details", pathway: "Suitable pathway" },
  fr: { title: "Votre position d'emploi", strengths: "Atouts principaux", barriers: "Freins principaux", details: "Détails de préparation", pathway: "Parcours adapté" }
};

export function EmploymentPositionSummary({ model, language }: { model: EmploymentHomeViewModel; language: EmploymentIntelligenceLanguage }) {
  const t = copy[language];
  const progress = model.position.readinessBand === "Strong" || model.position.readinessBand === "Solide" ? 92 : model.position.readinessBand.includes("Ready") || model.position.readinessBand.includes("Prêt") ? 72 : model.position.readinessBand.includes("Developing") || model.position.readinessBand.includes("développement") ? 48 : 22;
  return (
    <Card>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f87171]">{model.freshnessLabel}</p>
          <h2 className="mt-2 text-3xl font-black text-white">{t.title}</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-white/64">{model.freshnessDescription}</p>
        </div>
        <div className="w-full max-w-xs">
          <div className="mb-2 flex justify-between text-sm font-bold text-white/60">
            <span>{model.position.readinessBand}</span>
            <span>{model.position.confidenceLabel}</span>
          </div>
          <ProgressBar value={progress} />
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/7 p-4">
          <p className="text-sm font-black text-white">{t.strengths}</p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/66">
            {(model.position.strongestAssets.length ? model.position.strongestAssets : [language === "fr" ? "Preuves encore à confirmer" : "Evidence still being confirmed"]).map((item) => <li key={item}>- {item}</li>)}
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/7 p-4">
          <p className="text-sm font-black text-white">{t.barriers}</p>
          <div className="mt-3 grid gap-3">
            {model.position.barriers.length ? model.position.barriers.map((barrier) => (
              <Link key={barrier.code} href={barrier.route} className="block rounded-2xl border border-white/10 bg-black/10 p-3 text-sm leading-6 text-white/66">
                <strong className="text-white">{barrier.title}</strong>
                <span className="mt-1 block">{barrier.controlLabel}</span>
              </Link>
            )) : <p className="text-sm leading-6 text-white/66">{language === "fr" ? "Aucun frein majeur confirmé pour le moment." : "No major confirmed barrier yet."}</p>}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/7 p-4">
          <p className="text-sm font-black text-white">{t.pathway}</p>
          <p className="mt-3 text-sm leading-6 text-white/66">{model.position.suitablePathway}</p>
          <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">{model.position.supportIntensity}</p>
        </div>
      </div>
    </Card>
  );
}
