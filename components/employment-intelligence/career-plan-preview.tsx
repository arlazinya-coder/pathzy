import Link from "next/link";
import { Card, ProgressBar } from "@/components/ui";
import type { CareerPlanPreviewViewModel, EmploymentIntelligenceLanguage } from "@/lib/employment-intelligence/client";
import { appRoutes } from "@/lib/navigation/routes";

const copy = {
  en: { title: "Career Plan", body: "Your plan updates from action history, not from guesses.", open: "Open Career Plan", next: "Next steps", empty: "No active steps are waiting in this plan yet." },
  fr: { title: "Plan de carrière", body: "Votre plan se met à jour à partir de l'historique d'actions, pas de suppositions.", open: "Ouvrir le plan", next: "Prochaines étapes", empty: "Aucune étape active n'attend encore dans ce plan." }
};

export function CareerPlanPreview({ plan, language }: { plan: CareerPlanPreviewViewModel | null; language: EmploymentIntelligenceLanguage }) {
  const t = copy[language];
  if (!plan) {
    return (
      <Card>
        <h2 className="text-2xl font-black leading-tight text-white md:text-3xl">{t.title}</h2>
        <p className="mt-3 text-sm font-bold leading-6 text-white/64">{language === "fr" ? "Terminez le diagnostic pour créer votre plan." : "Complete the diagnosis to create your plan."}</p>
      </Card>
    );
  }
  const progress = plan.totalSteps ? Math.round((plan.completedSteps / plan.totalSteps) * 100) : 0;
  const [primaryStep, ...remainingSteps] = plan.nextSteps;
  return (
    <Card>
      <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#f87171] [overflow-wrap:anywhere]">{plan.horizon}</p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-white md:text-3xl">{t.title}</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-white/64 [overflow-wrap:anywhere]">{t.body}</p>
        </div>
        <Link href={appRoutes.careerPlan} className="tap-target inline-flex min-h-12 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3 text-center text-sm font-extrabold text-white/82 [overflow-wrap:anywhere]">{t.open}</Link>
      </div>
      <div className="mt-6">
        <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm font-bold text-white/60">
          <span>{plan.progressLabel}</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>
      <div className="mt-6 grid gap-3">
        <p className="text-sm font-black text-white">{t.next}</p>
        {primaryStep ? (
          <Link key={primaryStep.id} href={primaryStep.href} className="block min-w-0 rounded-[24px] border border-[#d93a46]/30 bg-white/7 p-4">
            <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-white/42 [overflow-wrap:anywhere]">{primaryStep.horizon} - {primaryStep.state}</span>
            <strong className="mt-2 block text-base leading-tight text-white [overflow-wrap:anywhere]">{primaryStep.title}</strong>
            <span className="mt-2 block text-sm leading-6 text-white/62 [overflow-wrap:anywhere]">{primaryStep.explanation}</span>
          </Link>
        ) : <p className="rounded-3xl border border-white/10 bg-white/7 p-4 text-sm font-bold leading-6 text-white/62">{t.empty}</p>}
        {remainingSteps.length ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-3">
            {remainingSteps.map((step) => (
              <Link key={step.id} href={step.href} className="block min-w-0 rounded-3xl border border-white/10 bg-white/7 p-4">
                <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-white/42 [overflow-wrap:anywhere]">{step.horizon} - {step.state}</span>
                <strong className="mt-2 block text-sm leading-tight text-white [overflow-wrap:anywhere]">{step.title}</strong>
                <span className="mt-2 block text-sm leading-6 text-white/62 [overflow-wrap:anywhere]">{step.explanation}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
