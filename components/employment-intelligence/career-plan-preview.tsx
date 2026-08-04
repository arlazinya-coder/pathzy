import Link from "next/link";
import { Card, ProgressBar } from "@/components/ui";
import type { CareerPlanPreviewViewModel, EmploymentIntelligenceLanguage } from "@/lib/employment-intelligence/client";
import { appRoutes } from "@/lib/navigation/routes";

const copy = {
  en: { title: "Career Plan", body: "Your plan updates from action history, not from guesses.", open: "Open Career Plan", next: "Next steps" },
  fr: { title: "Plan de carrière", body: "Votre plan se met à jour à partir de l'historique d'actions, pas de suppositions.", open: "Ouvrir le plan", next: "Prochaines étapes" }
};

export function CareerPlanPreview({ plan, language }: { plan: CareerPlanPreviewViewModel | null; language: EmploymentIntelligenceLanguage }) {
  const t = copy[language];
  if (!plan) {
    return (
      <Card>
        <h2 className="text-3xl font-black text-white">{t.title}</h2>
        <p className="mt-3 text-sm font-bold leading-6 text-white/64">{language === "fr" ? "Terminez le diagnostic pour créer votre plan." : "Complete the diagnosis to create your plan."}</p>
      </Card>
    );
  }
  const progress = plan.totalSteps ? Math.round((plan.completedSteps / plan.totalSteps) * 100) : 0;
  return (
    <Card>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f87171]">{plan.horizon}</p>
          <h2 className="mt-2 text-3xl font-black text-white">{t.title}</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-white/64">{t.body}</p>
        </div>
        <Link href={appRoutes.careerPlan} className="tap-target inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82">{t.open}</Link>
      </div>
      <div className="mt-6">
        <div className="mb-2 flex justify-between text-sm font-bold text-white/60">
          <span>{plan.progressLabel}</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>
      <div className="mt-6 grid gap-3">
        <p className="text-sm font-black text-white">{t.next}</p>
        {plan.nextSteps.map((step) => (
          <Link key={step.id} href={step.href} className="rounded-3xl border border-white/10 bg-white/7 p-4">
            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">{step.horizon} - {step.state}</span>
            <strong className="mt-2 block text-base text-white">{step.title}</strong>
            <span className="mt-2 block text-sm leading-6 text-white/62">{step.explanation}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
