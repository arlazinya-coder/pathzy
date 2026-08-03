import type { ReactNode } from "react";
import { ButtonLink, Card, ProgressBar } from "@/components/ui";
import { buildCareerAnalytics } from "@/lib/analytics/career-analytics-service";
import { summarizeApplicationTracker } from "@/lib/applications/application-tracker-service";
import { localizedProfessionalTitle, pathzyPhase2List, pathzyPhase2T } from "@/lib/language/pathzy-i18n";
import { normalizeLanguageCode, type SupportedLanguageCode } from "@/lib/language/language-preferences";
import { appRoutes } from "@/lib/navigation/routes";
import { getProfessionalIdentityReadModelSafe } from "@/lib/professional-identity/professional-identity-read-service";
import { getPathzyNextAction, type PathzyNextAction } from "@/lib/progress/next-action-engine";
import { getProgressMilestones, getProgressPercent, type ProgressInputs } from "@/lib/progress/progress-engine";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

function safeFirstToken(value: unknown) {
  if (typeof value !== "string") return "";
  const clean = value.trim();
  if (!clean || clean.includes("@")) return "";
  return clean.split(/\s+/)[0] ?? "";
}

const emptyProgressInputs: ProgressInputs = {
  profileComplete: false,
  discoveryComplete: false,
  careerGoalSelected: false,
  cvComplete: false,
  coverLetterComplete: false,
  linkedinComplete: false,
  careerPassportComplete: false,
  opportunitiesSaved: 0,
  trackerEntries: 0,
  applicationsSent: 0,
  activeApplicationTracked: false,
  interviewPrepComplete: false,
  offerReceived: false,
  employed: false,
  employmentReadinessScore: 0
};

function fallbackNextAction(): PathzyNextAction {
  const milestones = getProgressMilestones(emptyProgressInputs);
  const milestone = milestones[0];
  return {
    label: "Complete My Professional Profile",
    destinationRoute: appRoutes.professionalIdentity,
    reason: "PATHZY needs your confirmed profile before it can guide documents, jobs, applications, and interviews reliably.",
    completionState: "not_started",
    progressInputs: emptyProgressInputs,
    progressPercent: getProgressPercent(emptyProgressInputs),
    milestone,
    availableActions: [],
    milestones
  };
}

function greetingFor(language: SupportedLanguageCode, date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return pathzyPhase2T(language, "home.greeting.morning");
  if (hour < 18) return pathzyPhase2T(language, "home.greeting.afternoon");
  return pathzyPhase2T(language, "home.greeting.evening");
}

function initialsFor(name: string) {
  const clean = name.trim();
  if (!clean) return "P";
  return clean.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

async function safeQuery<T>(label: string, query: PromiseLike<{ data: T | null; error: { message?: string } | null }>, fallback: T): Promise<T> {
  try {
    const { data, error } = await query;
    if (error) {
      console.warn(`[pathzy-home] ${label} unavailable`, error.message ?? error);
      return fallback;
    }
    return data ?? fallback;
  } catch (error) {
    console.warn(`[pathzy-home] ${label} failed`, error);
    return fallback;
  }
}

function HomeCard({
  eyebrow,
  title,
  children,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <Card className="group">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563EB]">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#111827] md:text-4xl">{title}</h2>
          <div className="mt-4 text-base leading-7 text-[#6B7280]">{children}</div>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <ButtonLink href={primaryHref}>{primaryLabel}</ButtonLink>
          {secondaryHref && secondaryLabel ? <ButtonLink href={secondaryHref} variant="secondary">{secondaryLabel}</ButtonLink> : null}
        </div>
      </div>
    </Card>
  );
}

export default async function RoadmapPage() {
  const { user, supabase } = await requireAuthenticatedUser(appRoutes.roadmap);
  const [identityReadModel, nextAction, applications, timelineEvents, matchAnalyses, professionalDocuments] = await Promise.all([
    getProfessionalIdentityReadModelSafe(supabase, user, "home identity"),
    getPathzyNextAction(supabase, user).catch((error) => {
      console.warn("[pathzy-home] next action fallback", error);
      return fallbackNextAction();
    }),
    safeQuery(
      "applications",
      supabase
        .from("employment_applications")
        .select("id,company_name,role,opportunity_type,source,status,application_date,follow_up_date,closing_date,next_action_date,next_action,interview_date,updated_at,created_at,targeted_cv_document_id,cover_letter_document_id,job_match_analysis_id")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(100),
      []
    ),
    safeQuery(
      "application timeline",
      supabase
        .from("application_timeline_events")
        .select("id,application_id,event_type,event_at")
        .eq("user_id", user.id)
        .order("event_at", { ascending: false })
        .limit(100),
      []
    ),
    safeQuery(
      "job match analytics",
      supabase
        .from("job_match_analyses")
        .select("id,gaps_json,requirement_matches_json,recommendations_json,created_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(100),
      []
    ),
    safeQuery(
      "professional document analytics",
      supabase
        .from("professional_documents")
        .select("id,name,document_type,template_id,target_role,updated_at")
        .eq("user_id", user.id)
        .eq("document_type", "cv")
        .order("updated_at", { ascending: false })
        .limit(100),
      []
    )
  ]);
  const profile = identityReadModel.profile;
  const interfaceLanguage = normalizeLanguageCode(identityReadModel.values.interface_language ?? profile?.language);
  const phase2T = (key: Parameters<typeof pathzyPhase2T>[1]) => pathzyPhase2T(interfaceLanguage, key);
  const profileFirstName = safeFirstToken(profile?.full_name);
  const accountFirstName =
    safeFirstToken(user?.user_metadata?.display_name) ||
    safeFirstToken(user?.user_metadata?.full_name) ||
    safeFirstToken(user?.user_metadata?.name);
  const firstName = profileFirstName || accountFirstName || phase2T("home.greeting.fallbackName");
  const profileName = profile?.full_name?.trim() || user.user_metadata?.full_name || user.email?.split("@")[0] || "PATHZY";
  const professionalDirection = localizedProfessionalTitle(interfaceLanguage, profile?.career_goal || profile?.preferred_path || "");
  const location = [profile?.city, profile?.country].filter(Boolean).join(", ");
  const professionalIdentityPercent = identityReadModel.completion.percentage;
  const applicationSummary = summarizeApplicationTracker(applications as never[]);
  const analytics = buildCareerAnalytics({
    applications: applications as never[],
    timelineEvents: timelineEvents as never[],
    matchAnalyses: matchAnalyses as never[],
    professionalDocuments: professionalDocuments as never[],
    period: { type: "90d" },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC"
  });
  const topInsight = analytics.recommendedActions[0];
  const nextActionLabelKeys: Record<string, Parameters<typeof pathzyPhase2T>[1]> = {
    "Complete Professional Identity": "home.next.completeProfessionalIdentity",
    "Complete My Professional Profile": "home.next.completeProfile",
    "Open Employment Center": "home.next.openEmploymentCenter",
    "Track application": "home.next.trackApplication",
    "Save or start an application": "home.next.startApplication",
    "Prepare for interview": "home.next.prepareInterview",
    "Improve missing skills": "home.next.improveSkills"
  };
  const nextActionReasonKeys: Record<string, Parameters<typeof pathzyPhase2T>[1]> = {
    "PATHZY needs your confirmed profile before it can guide documents, jobs, applications, and interviews reliably.": "home.next.profileReason",
    "PATHZY needs your profile details before it can create stronger documents and guidance.": "home.next.profileReason",
    "Use Employment Center to manage CVs, cover letters, LinkedIn content, and other professional materials from one place.": "home.next.centerReason"
  };
  const translatedNextLabel = nextActionLabelKeys[nextAction.label] ? phase2T(nextActionLabelKeys[nextAction.label]) : nextAction.label;
  const translatedNextReason = nextActionReasonKeys[nextAction.reason]
    ? phase2T(nextActionReasonKeys[nextAction.reason])
    : interfaceLanguage === "fr"
      ? phase2T("home.next.profileReason")
      : nextAction.reason;
  const opportunitiesSummary = phase2T("home.opportunities.summary")
    .replace("{active}", String(applicationSummary.activeApplications))
    .replace("{followUps}", String(applicationSummary.followUpsDue))
    .replace("{interviews}", String(applicationSummary.interviews));
  const topInsightReason = interfaceLanguage === "fr"
    ? phase2T("home.guidance.fallbackInsight")
    : topInsight?.reason ?? phase2T("home.guidance.fallbackInsight");

  return (
    <main className="container page-pad">
      <section className="mb-10">
        <div className="flex flex-col gap-6 rounded-[34px] border border-[#e5e7eb] bg-white p-6 shadow-[0_18px_55px_rgba(17,24,39,.08)] md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-center gap-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-[#eff6ff] text-xl font-semibold text-[#2563EB]">
              {initialsFor(profileName)}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2563EB]">{greetingFor(interfaceLanguage)}, {firstName}.</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-[#111827] md:text-5xl">{professionalDirection}</h1>
              {location ? <p className="mt-2 text-base text-[#6B7280]">{location}</p> : null}
            </div>
          </div>
          <div className="w-full max-w-xs">
            <div className="mb-2 flex justify-between text-sm font-semibold text-[#6B7280]">
              <span>{phase2T("home.identityLabel")}</span>
              <span>{professionalIdentityPercent}% {phase2T("home.complete")}</span>
            </div>
            <ProgressBar value={professionalIdentityPercent} />
          </div>
        </div>
      </section>

      <section aria-label={phase2T("home.aria")} className="grid gap-5">
        <HomeCard
          eyebrow={phase2T("home.continue.eyebrow")}
          title={phase2T("home.continue.title")}
          primaryHref={nextAction.destinationRoute}
          primaryLabel={phase2T("home.continue.primary")}
          secondaryHref={appRoutes.professionalIdentity}
          secondaryLabel={phase2T("home.continue.secondary")}
        >
          <p className="font-medium text-[#111827]">{translatedNextLabel}</p>
          <p className="mt-2">{translatedNextReason}</p>
          <div className="mt-5 max-w-xl">
            <div className="mb-2 flex justify-between text-sm font-medium text-[#6B7280]">
              <span>{phase2T("home.continue.progress")}</span>
              <span>{nextAction.progressPercent}%</span>
            </div>
            <ProgressBar value={nextAction.progressPercent} />
          </div>
        </HomeCard>

        <HomeCard
          eyebrow={phase2T("home.employmentCenter.eyebrow")}
          title={phase2T("home.employmentCenter.title")}
          primaryHref={appRoutes.employmentCenter}
          primaryLabel={phase2T("home.employmentCenter.primary")}
          secondaryHref={appRoutes.documents}
          secondaryLabel={phase2T("home.employmentCenter.secondary")}
        >
          <p>
            {phase2T("home.employmentCenter.body")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {pathzyPhase2List(interfaceLanguage, "home.employmentCenter.tags").map((item) => (
              <span key={item} className="rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1 text-sm font-medium text-[#6B7280]">{item}</span>
            ))}
          </div>
        </HomeCard>

        <HomeCard
          eyebrow={phase2T("home.opportunities.eyebrow")}
          title={phase2T("home.opportunities.title")}
          primaryHref={appRoutes.opportunities}
          primaryLabel={phase2T("home.opportunities.primary")}
        >
          <p>
            {phase2T("home.opportunities.body")}
          </p>
          <p className="mt-3 text-sm font-medium text-[#111827]">
            {opportunitiesSummary}
          </p>
        </HomeCard>

        <HomeCard
          eyebrow={phase2T("home.guidance.eyebrow")}
          title={phase2T("home.guidance.title")}
          primaryHref={appRoutes.mentor}
          primaryLabel={phase2T("home.guidance.primary")}
          secondaryHref={appRoutes.careerAnalytics}
          secondaryLabel={phase2T("home.guidance.secondary")}
        >
          <p>
            {phase2T("home.guidance.body")}
          </p>
          <p className="mt-3 text-sm font-medium text-[#111827]">
            {topInsightReason}
          </p>
        </HomeCard>
      </section>
    </main>
  );
}
