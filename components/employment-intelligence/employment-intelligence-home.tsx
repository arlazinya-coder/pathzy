import { CareerPlanPreview } from "./career-plan-preview";
import { EmptyIntelligenceState } from "./empty-intelligence-state";
import { EmploymentActionCard } from "./employment-action-card";
import { EmploymentPositionSummary } from "./employment-position-summary";
import { IntelligenceFreshnessPanel } from "./intelligence-freshness-panel";
import { ReadinessDetails } from "./readiness-details";
import type { EmploymentHomeViewModel, EmploymentIntelligenceLanguage } from "@/lib/employment-intelligence/client";
import { ButtonLink, Card } from "@/components/ui";
import { appRoutes } from "@/lib/navigation/routes";

export function EmploymentIntelligenceHome({ model, language }: { model: EmploymentHomeViewModel; language: EmploymentIntelligenceLanguage }) {
  if (!model.primaryAction && model.status === "not_generated") return <EmptyIntelligenceState language={language} />;
  return (
    <section className="grid gap-5" aria-label={language === "fr" ? "Accueil personnalisé PATHZY" : "Personalised PATHZY Home"}>
      <IntelligenceFreshnessPanel model={model} language={language} />
      {model.primaryAction ? <EmploymentActionCard action={model.primaryAction} language={language} /> : <EmptyIntelligenceState language={language} />}
      <EmploymentPositionSummary model={model} language={language} />
      <CareerPlanPreview plan={model.careerPlan} language={language} />
      <Card>
        <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f87171]">{language === "fr" ? "Outils" : "Tools"}</p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-white md:text-3xl">{language === "fr" ? "Actions secondaires" : "Secondary actions"}</h2>
            <p className="mt-3 text-sm font-bold leading-6 text-white/64 [overflow-wrap:anywhere]">{language === "fr" ? "Jusqu'à trois actions utiles, dans l'ordre PATHZY." : "Up to three useful actions, in PATHZY order."}</p>
          </div>
          <div className="shrink-0">
            <ButtonLink href={appRoutes.employmentCenter} variant="secondary">{language === "fr" ? "Centre d'emploi" : "Employment Center"}</ButtonLink>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] items-stretch gap-4">
          {model.secondaryActions.map((action) => <EmploymentActionCard key={action.code} action={action} language={language} priority="secondary" />)}
          {!model.secondaryActions.length ? <p className="text-sm font-bold leading-6 text-white/62">{language === "fr" ? "Aucune action secondaire pour le moment." : "No secondary actions right now."}</p> : null}
        </div>
      </Card>
      <ReadinessDetails model={model} language={language} />
    </section>
  );
}
