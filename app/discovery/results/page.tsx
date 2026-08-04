import { CareerPlanPreview, EmploymentActionCard, EmploymentPositionSummary, ReadinessDetails } from "@/components/employment-intelligence";
import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { buildEmploymentHomeViewModel, type EmploymentIntelligenceLanguage } from "@/lib/employment-intelligence/client";
import { getDetailedEmploymentIntelligence } from "@/lib/employment-intelligence/application";
import { normalizeLanguageCode } from "@/lib/language/language-preferences";
import { appRoutes } from "@/lib/navigation/routes";
import { getProfessionalIdentityReadModelSafe } from "@/lib/professional-identity/professional-identity-read-service";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

const copy = {
  en: {
    eyebrow: "Employment Diagnosis Results",
    title: "What PATHZY understood",
    body: "These results come from persisted Employment Intelligence. They explain your current position, useful evidence, barriers, first action and Career Plan.",
    correct: "Review or correct information",
    home: "Continue to Home",
    uncertain: "What remains uncertain"
  },
  fr: {
    eyebrow: "Résultats du Diagnostic d'emploi",
    title: "Ce que PATHZY a compris",
    body: "Ces résultats viennent des informations d'emploi sauvegardées. Ils expliquent votre position, vos preuves utiles, vos freins, la première action et le Plan de carrière.",
    correct: "Vérifier ou corriger mes informations",
    home: "Continuer vers l'accueil",
    uncertain: "Ce qui reste incertain"
  }
};

export default async function DiagnosisResultsPage() {
  const { user, supabase } = await requireAuthenticatedUser(appRoutes.diagnosisResults);
  const [identityReadModel, detail] = await Promise.all([
    getProfessionalIdentityReadModelSafe(supabase, user, "diagnosis results identity"),
    getDetailedEmploymentIntelligence(supabase, user.id)
  ]);
  const language = normalizeLanguageCode(identityReadModel.values.interface_language ?? identityReadModel.profile?.language) as EmploymentIntelligenceLanguage;
  const t = copy[language];
  const model = buildEmploymentHomeViewModel(detail, language);
  const missing = (detail as { intelligence?: { overallReadiness?: { missingInformation?: string[] } } }).intelligence?.overallReadiness?.missingInformation ?? [];

  return (
    <main className="container page-pad">
      <PageHeader eyebrow={t.eyebrow} title={t.title}>{t.body}</PageHeader>
      <div className="mb-5 flex flex-wrap gap-3">
        <ButtonLink href={appRoutes.authenticatedHome}>{t.home}</ButtonLink>
        <ButtonLink href={appRoutes.professionalIdentity} variant="secondary">{t.correct}</ButtonLink>
      </div>
      <section className="grid gap-5">
        {model.primaryAction ? <EmploymentActionCard action={model.primaryAction} language={language} /> : null}
        <EmploymentPositionSummary model={model} language={language} />
        <CareerPlanPreview plan={model.careerPlan} language={language} />
        <Card>
          <h2 className="text-2xl font-black text-white">{t.uncertain}</h2>
          {missing.length ? (
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-white/66">
              {missing.slice(0, 5).map((item) => <li key={item}>- {item}</li>)}
            </ul>
          ) : (
            <p className="mt-3 text-sm font-bold leading-6 text-white/64">{language === "fr" ? "Aucune incertitude majeure à afficher pour le moment." : "No major uncertainty to show right now."}</p>
          )}
        </Card>
        <ReadinessDetails model={model} language={language} />
      </section>
    </main>
  );
}
