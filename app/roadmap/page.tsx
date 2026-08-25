import Link from "next/link";
import { ButtonLink, Card } from "@/components/ui";
import { buildEmploymentHomeViewModel, type EmploymentActionViewModel, type EmploymentIntelligenceLanguage } from "@/lib/employment-intelligence/client";
import { getDetailedEmploymentIntelligence } from "@/lib/employment-intelligence/application";
import { localizedProfessionalTitle, pathzyPhase2T } from "@/lib/language/pathzy-i18n";
import { normalizeLanguageCode } from "@/lib/language/language-preferences";
import { professionalIdentitySectionHref } from "@/lib/navigation/auth-routing";
import { appRoutes } from "@/lib/navigation/routes";
import { professionalIdentityRequiredChecksFromValues } from "@/lib/professional-identity/professional-identity-completion";
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

type HomeDestination = {
  title: string;
  body: string;
  href: string;
};

type HomeNextStep = {
  title: string;
  body: string;
  href: string;
  cta: string;
  secondary?: Array<{ label: string; href: string }>;
};

function homeDestinations(language: EmploymentIntelligenceLanguage): HomeDestination[] {
  if (language === "fr") {
    return [
      { title: "Identite professionnelle", body: "Verifiez les informations que PATHZY utilise pour vous guider.", href: appRoutes.professionalIdentity },
      { title: "Centre d'emploi", body: "Ouvrez les espaces principaux de votre parcours.", href: appRoutes.employmentCenter },
      { title: "Opportunites", body: "Trouvez des emplois a examiner quand vous etes pret.", href: appRoutes.opportunities },
      { title: "Candidatures", body: "Suivez les candidatures que vous avez commencees.", href: appRoutes.applications }
    ];
  }

  return [
    { title: "Professional Identity", body: "Review the information PATHZY uses to guide you.", href: appRoutes.professionalIdentity },
    { title: "Employment Center", body: "Open the main spaces for your employment journey.", href: appRoutes.employmentCenter },
    { title: "Opportunities", body: "Find jobs to review when you are ready.", href: appRoutes.opportunities },
    { title: "Applications", body: "Track applications you have started.", href: appRoutes.applications }
  ];
}

function fallbackNextStep(language: EmploymentIntelligenceLanguage): HomeNextStep {
  return language === "fr"
    ? {
        title: "Preparer votre CV",
        body: "Transformez votre Identite professionnelle en CV clair et pret a relire.",
        href: appRoutes.professionalIdentityCv,
        cta: "Ouvrir mon CV",
        secondary: [{ label: "Centre d'emploi", href: appRoutes.employmentCenter }]
      }
    : {
        title: "Prepare your CV",
        body: "Turn your Professional Identity into a clear CV that is ready to review.",
        href: appRoutes.professionalIdentityCv,
        cta: "Open My CV",
        secondary: [{ label: "Employment Center", href: appRoutes.employmentCenter }]
      };
}

function nextStepFromAction(action: EmploymentActionViewModel | null, language: EmploymentIntelligenceLanguage): HomeNextStep {
  if (!action) return fallbackNextStep(language);
  return {
    title: action.plainTitle || action.title,
    body: action.explanation || action.whySentence || (language === "fr" ? "Commencez par cette etape utile." : "Start with this useful step."),
    href: action.href || appRoutes.employmentCenter,
    cta: language === "fr" ? "Commencer" : "Start",
    secondary: [{ label: language === "fr" ? "Centre d'emploi" : "Employment Center", href: appRoutes.employmentCenter }]
  };
}

function buildNextStep(
  language: EmploymentIntelligenceLanguage,
  missingRequired: ReturnType<typeof professionalIdentityRequiredChecksFromValues>,
  primaryAction: EmploymentActionViewModel | null
): HomeNextStep {
  const firstMissing = missingRequired.find((item) => !item.complete);
  if (firstMissing) {
    return language === "fr"
      ? {
          title: "Mettre a jour votre Identite professionnelle",
          body: `${firstMissing.label} manque encore. Vous pouvez le corriger sans quitter votre parcours.`,
          href: professionalIdentitySectionHref(firstMissing.section, appRoutes.roadmap),
          cta: `Completer ${firstMissing.label}`,
          secondary: [{ label: "Voir les opportunites", href: appRoutes.opportunities }]
        }
      : {
          title: "Update your Professional Identity",
          body: `${firstMissing.label} is still missing. You can fix it without leaving your journey.`,
          href: professionalIdentitySectionHref(firstMissing.section, appRoutes.roadmap),
          cta: `Complete ${firstMissing.label}`,
          secondary: [{ label: "View Opportunities", href: appRoutes.opportunities }]
        };
  }
  return nextStepFromAction(primaryAction, language);
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
  const missingRequired = professionalIdentityRequiredChecksFromValues(identityReadModel.values).filter((item) => item.status === "required");
  const nextStep = buildNextStep(language, missingRequired, model.primaryAction);
  const destinations = homeDestinations(language);

  return (
    <main className="container page-pad">
      <section className="grid gap-8" aria-label={language === "fr" ? "Accueil personnalise PATHZY" : "Personalised PATHZY Home"}>
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#f87171]">{greetingFor(interfaceLanguage)}</p>
          <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-normal text-white md:text-6xl">
            {language === "fr" ? "Bon retour" : "Welcome back"}, {firstName}
          </h1>
          <p className="mt-4 text-base leading-7 text-white/68 md:text-lg">
            {language === "fr"
              ? `Votre espace PATHZY est pret. ${professionalDirection} reste votre direction actuelle.`
              : `Your PATHZY space is ready. ${professionalDirection} is your current direction.`}
          </p>
        </div>

        <Card className="border-white/10 bg-white/[0.06]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f87171]">{language === "fr" ? "Votre PATHZY" : "Your PATHZY"}</p>
              <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">{language === "fr" ? "Ou voulez-vous aller ?" : "Where would you like to go?"}</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.map((destination) => (
              <Link
                key={destination.href}
                href={destination.href}
                className="rounded-[20px] border border-white/10 bg-white/[0.07] p-4 transition hover:-translate-y-0.5 hover:border-[#f87171]/40 hover:bg-white/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--pathzy-red)]"
              >
                <h3 className="text-lg font-black text-white">{destination.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/62">{destination.body}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="border-[#7f1d1d]/28 bg-[#1b1110]/84">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f87171]">{language === "fr" ? "Prochaine etape" : "Next best step"}</p>
              <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">{nextStep.title}</h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/66">{nextStep.body}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <ButtonLink href={nextStep.href}>{nextStep.cta}</ButtonLink>
              {nextStep.secondary?.slice(0, 2).map((action) => (
                <ButtonLink key={action.href} href={action.href} variant="secondary">{action.label}</ButtonLink>
              ))}
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
