import { CareerPlanPreview, EmploymentActionCard, EmploymentPositionSummary, ReadinessDetails } from "@/components/employment-intelligence";
import { IntelligenceFreshnessPanel } from "@/components/employment-intelligence/intelligence-freshness-panel";
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
    uncertain: "What remains uncertain",
    preparingTitle: "Preparing your employment insights",
    preparingBody: "PATHZY has not found a saved Employment Intelligence result yet. You can return to the diagnosis or ask PATHZY to prepare the result again.",
    unavailableTitle: "Employment insights need setup",
    unavailableBody: "PATHZY cannot load saved Employment Intelligence yet. Your Professional Identity and Diagnosis are safe, but the Phase 3 persistence setup must be completed before results can be shown.",
    retryHelp: "Use update only after setup is complete."
  },
  fr: {
    eyebrow: "Résultats du Diagnostic d'emploi",
    title: "Ce que PATHZY a compris",
    body: "Ces résultats viennent des informations d'emploi sauvegardées. Ils expliquent votre position, vos preuves utiles, vos freins, la première action et le Plan de carrière.",
    correct: "Vérifier ou corriger mes informations",
    home: "Continuer vers l'accueil",
    uncertain: "Ce qui reste incertain",
    preparingTitle: "Préparation de vos informations d'emploi",
    preparingBody: "PATHZY n'a pas encore trouvé de résultat d'Intelligence Emploi sauvegardé. Vous pouvez reprendre le diagnostic ou demander à PATHZY de préparer le résultat.",
    unavailableTitle: "Configuration requise",
    unavailableBody: "PATHZY ne peut pas encore charger les informations d'emploi sauvegardées. Votre Identité Professionnelle et votre Diagnostic sont conservés, mais la configuration de persistance Phase 3 doit être terminée avant d'afficher les résultats.",
    retryHelp: "Utilisez la mise à jour seulement après la configuration."
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
  const status = detail.status ?? "not_generated";

  return (
    <main className="container page-pad">
      <PageHeader eyebrow={t.eyebrow} title={t.title}>{t.body}</PageHeader>
      <div className="mb-5 flex flex-wrap gap-3">
        <ButtonLink href={appRoutes.authenticatedHome}>{t.home}</ButtonLink>
        <ButtonLink href={appRoutes.professionalIdentity} variant="secondary">{t.correct}</ButtonLink>
      </div>
      {status === "unavailable" ? (
        <Card>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#fbbf24]">{language === "fr" ? "Action requise" : "Action required"}</p>
          <h2 className="mt-2 text-3xl font-black text-white">{t.unavailableTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-white/64">{t.unavailableBody}</p>
          <p className="mt-3 text-sm font-bold text-white/50">{t.retryHelp}</p>
        </Card>
      ) : status === "not_generated" ? (
        <Card>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#93c5fd]">{language === "fr" ? "Préparation" : "Preparing"}</p>
          <h2 className="mt-2 text-3xl font-black text-white">{t.preparingTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-white/64">{t.preparingBody}</p>
          <div className="mt-5">
            <IntelligenceFreshnessPanel model={model} language={language} />
          </div>
        </Card>
      ) : null}
      <section className="grid gap-5">
        {status !== "unavailable" && status !== "not_generated" ? (
          <>
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
          </>
        ) : null}
      </section>
    </main>
  );
}
