import Link from "next/link";
import { EmploymentActionCard } from "@/components/employment-intelligence";
import { ButtonLink, Card, PageHeader, ProgressBar } from "@/components/ui";
import { buildEmploymentActionViewModel, buildEmploymentHomeViewModel, type EmploymentIntelligenceLanguage } from "@/lib/employment-intelligence/client";
import { getDetailedEmploymentIntelligence } from "@/lib/employment-intelligence/application";
import type { CareerPlan } from "@/lib/employment-intelligence/domain";
import { normalizeLanguageCode } from "@/lib/language/language-preferences";
import { appRoutes } from "@/lib/navigation/routes";
import { getProfessionalIdentityReadModelSafe } from "@/lib/professional-identity/professional-identity-read-service";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

const copy = {
  en: {
    eyebrow: "Career Plan",
    title: "Your PATHZY Career Plan",
    body: "This plan is persisted and updated through Action History. It does not replace your Professional Identity.",
    back: "Back to Home",
    noPlan: "Your Career Plan is not available yet.",
    noPlanBody: "Complete Employment Diagnosis or update your employment insights to create a plan.",
    update: "Update insights"
  },
  fr: {
    eyebrow: "Plan de carrière",
    title: "Votre Plan de carrière PATHZY",
    body: "Ce plan est sauvegardé et mis à jour avec l'historique d'actions. Il ne remplace pas votre Identité Professionnelle.",
    back: "Retour à l'accueil",
    noPlan: "Votre Plan de carrière n'est pas encore disponible.",
    noPlanBody: "Terminez le Diagnostic d'emploi ou mettez à jour vos informations d'emploi pour créer un plan.",
    update: "Mettre à jour"
  }
};

function horizonLabel(value: string, language: EmploymentIntelligenceLanguage) {
  const labels = {
    en: { TODAY: "Today", THIS_WEEK: "This week", THIS_MONTH: "This month", NEXT_3_MONTHS: "Next 3 months", LONGER_TERM: "Longer-term" },
    fr: { TODAY: "Aujourd'hui", THIS_WEEK: "Cette semaine", THIS_MONTH: "Ce mois-ci", NEXT_3_MONTHS: "Les 3 prochains mois", LONGER_TERM: "Plus long terme" }
  };
  return labels[language][value as keyof typeof labels.en] ?? value;
}

export default async function CareerPlanPage() {
  const { user, supabase } = await requireAuthenticatedUser(appRoutes.careerPlan);
  const [identityReadModel, detail] = await Promise.all([
    getProfessionalIdentityReadModelSafe(supabase, user, "career plan identity"),
    getDetailedEmploymentIntelligence(supabase, user.id)
  ]);
  const language = normalizeLanguageCode(identityReadModel.values.interface_language ?? identityReadModel.profile?.language) as EmploymentIntelligenceLanguage;
  const t = copy[language];
  const model = buildEmploymentHomeViewModel(detail, language);
  const plan = (detail as { careerPlan?: CareerPlan | null }).careerPlan;
  const progress = model.careerPlan?.totalSteps ? Math.round((model.careerPlan.completedSteps / model.careerPlan.totalSteps) * 100) : 0;

  return (
    <main className="container page-pad">
      <PageHeader eyebrow={t.eyebrow} title={t.title}>{t.body}</PageHeader>
      <div className="mb-5">
        <ButtonLink href={appRoutes.authenticatedHome} variant="secondary">{t.back}</ButtonLink>
      </div>
      {!plan ? (
        <Card>
          <h2 className="text-3xl font-black text-white">{t.noPlan}</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-white/64">{t.noPlanBody}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href={appRoutes.discovery}>{language === "fr" ? "Ouvrir le diagnostic" : "Open Diagnosis"}</ButtonLink>
            <ButtonLink href={appRoutes.authenticatedHome} variant="secondary">{t.back}</ButtonLink>
          </div>
        </Card>
      ) : (
        <section className="grid gap-5">
          <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-black text-white">{model.careerPlan?.immediateGoal}</h2>
                <p className="mt-3 text-sm font-bold leading-6 text-white/64">{model.careerPlan?.longTermGoal}</p>
              </div>
              <p className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-black text-white/70">{model.careerPlan?.progressLabel}</p>
            </div>
            <div className="mt-5">
              <ProgressBar value={progress} />
            </div>
          </Card>
          {["TODAY", "THIS_WEEK", "THIS_MONTH", "NEXT_3_MONTHS", "LONGER_TERM"].map((horizon) => {
            const steps = plan.steps.filter((step) => step.horizon === horizon);
            if (!steps.length) return null;
            return (
              <Card key={horizon}>
                <h2 className="text-2xl font-black text-white">{horizonLabel(horizon, language)}</h2>
                <div className="mt-5 grid gap-4">
                  {steps.map((step) => {
                    const action = buildEmploymentActionViewModel(
                      {
                        actionCode: step.actionCode ?? step.id,
                        title: step.title ?? step.action,
                        plainLanguageExplanation: step.reason,
                        reason: step.reason,
                        urgency: step.urgency,
                        expectedImpact: step.expectedOutcome ?? step.measurableOutcome,
                        estimatedEffort: step.effort,
                        prerequisites: step.dependencies ?? [],
                        blockedBy: step.dependency ? [step.dependency] : [],
                        destination: { route: step.supportRoute ?? appRoutes.employmentCenter },
                        supportingEvidence: step.evidence,
                        confidence: step.confidence,
                        completionCriteria: step.completionCriteria ?? [],
                        sourceEngineVersion: step.sourceEngineVersion ?? plan.engineVersion,
                        state: step.state === "BLOCKED" ? "BLOCKED" : step.state === "COMPLETED" ? "ALREADY_COMPLETED" : "ELIGIBLE",
                        presentationMode: "STANDARD"
                      },
                      language
                    );
                    return action ? <EmploymentActionCard key={step.id} action={action} language={language} priority="secondary" /> : (
                      <Link key={step.id} href={step.supportRoute ?? appRoutes.employmentCenter} className="rounded-3xl border border-white/10 bg-white/7 p-4 text-white">{step.title ?? step.action}</Link>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </main>
  );
}
