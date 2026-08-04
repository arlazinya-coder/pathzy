import { EmploymentIntelligenceHome } from "@/components/employment-intelligence";
import { PageHeader } from "@/components/ui";
import { buildEmploymentHomeViewModel, type EmploymentIntelligenceLanguage } from "@/lib/employment-intelligence/client";
import { getDetailedEmploymentIntelligence } from "@/lib/employment-intelligence/application";
import { localizedProfessionalTitle, pathzyPhase2T } from "@/lib/language/pathzy-i18n";
import { normalizeLanguageCode } from "@/lib/language/language-preferences";
import { appRoutes } from "@/lib/navigation/routes";
import { getProfessionalIdentityReadModelSafe } from "@/lib/professional-identity/professional-identity-read-service";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

function safeFirstToken(value: unknown) {
  if (typeof value !== "string") return "";
  const clean = value.trim();
  if (!clean || clean.includes("@")) return "";
  return clean.split(/\s+/)[0] ?? "";
}

function greetingFor(language: EmploymentIntelligenceLanguage, date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return pathzyPhase2T(language, "home.greeting.morning");
  if (hour < 18) return pathzyPhase2T(language, "home.greeting.afternoon");
  return pathzyPhase2T(language, "home.greeting.evening");
}

export default async function RoadmapPage() {
  const { user, supabase } = await requireAuthenticatedUser(appRoutes.roadmap);
  const [identityReadModel, intelligence] = await Promise.all([
    getProfessionalIdentityReadModelSafe(supabase, user, "employment intelligence home identity"),
    getDetailedEmploymentIntelligence(supabase, user.id)
  ]);
  const profile = identityReadModel.profile;
  const interfaceLanguage = normalizeLanguageCode(identityReadModel.values.interface_language ?? profile?.language) as EmploymentIntelligenceLanguage;
  const language = interfaceLanguage;
  const firstName =
    safeFirstToken(profile?.full_name) ||
    safeFirstToken(user?.user_metadata?.display_name) ||
    safeFirstToken(user?.user_metadata?.full_name) ||
    safeFirstToken(user?.user_metadata?.name) ||
    pathzyPhase2T(language, "home.greeting.fallbackName");
  const professionalDirection = localizedProfessionalTitle(interfaceLanguage, profile?.career_goal || profile?.preferred_path || "");
  const model = buildEmploymentHomeViewModel(intelligence, language);

  return (
    <main className="container page-pad">
      <PageHeader eyebrow={greetingFor(interfaceLanguage)} title={`${firstName}, ${professionalDirection}`}>
        {language === "fr"
          ? "PATHZY utilise votre Identité Professionnelle, votre Diagnostic d'emploi et vos actions sauvegardées pour vous montrer la prochaine étape utile."
          : "PATHZY uses your Professional Identity, Employment Diagnosis and saved action history to show the next useful step."}
      </PageHeader>
      <EmploymentIntelligenceHome model={model} language={language} />
    </main>
  );
}
