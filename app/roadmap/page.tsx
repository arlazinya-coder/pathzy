import type { ReactNode } from "react";
import { ButtonLink, Card, ProgressBar } from "@/components/ui";
import { buildCareerAnalytics } from "@/lib/analytics/career-analytics-service";
import { summarizeApplicationTracker } from "@/lib/applications/application-tracker-service";
import { professionalIdentityRequiredChecks } from "@/lib/navigation/auth-routing";
import { appRoutes } from "@/lib/navigation/routes";
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

function greetingFor(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
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
  const [profile, discovery, nextAction, applications, timelineEvents, matchAnalyses, professionalDocuments] = await Promise.all([
    safeQuery<{ full_name?: string | null; email?: string | null; city?: string | null; country?: string | null; education?: string | null; highest_qualification?: string | null; field_of_study?: string | null; current_status?: string | null; career_goal?: string | null; preferred_path?: string | null; onboarding_completed?: boolean | null } | null>(
      "profile",
      supabase
        .from("user_profiles")
        .select("full_name,email,city,country,education,highest_qualification,field_of_study,current_status,career_goal,preferred_path,onboarding_completed")
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle(),
      null
    ),
    safeQuery<{ answers?: Record<string, unknown> | null } | null>(
      "profile answers",
      supabase
        .from("discovery_responses")
        .select("answers")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      null
    ),
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
  const profileFirstName = safeFirstToken(profile?.full_name);
  const accountFirstName =
    safeFirstToken(user?.user_metadata?.display_name) ||
    safeFirstToken(user?.user_metadata?.full_name) ||
    safeFirstToken(user?.user_metadata?.name);
  const firstName = profileFirstName || accountFirstName || "there";
  const profileName = profile?.full_name?.trim() || user.user_metadata?.full_name || user.email?.split("@")[0] || "PATHZY";
  const professionalDirection = profile?.career_goal || profile?.preferred_path || "Professional direction in progress";
  const location = [profile?.city, profile?.country].filter(Boolean).join(", ");
  const requiredChecks = professionalIdentityRequiredChecks(profile, discovery, user);
  const professionalIdentityPercent = Math.max(nextAction.progressPercent, Math.round((requiredChecks.filter((item) => item.complete).length / requiredChecks.length) * 72));
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

  return (
    <main className="container page-pad">
      <section className="mb-10">
        <div className="flex flex-col gap-6 rounded-[34px] border border-[#e5e7eb] bg-white p-6 shadow-[0_18px_55px_rgba(17,24,39,.08)] md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-center gap-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-[#eff6ff] text-xl font-semibold text-[#2563EB]">
              {initialsFor(profileName)}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2563EB]">{greetingFor()}, {firstName}.</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-[#111827] md:text-5xl">{professionalDirection}</h1>
              {location ? <p className="mt-2 text-base text-[#6B7280]">{location}</p> : null}
            </div>
          </div>
          <div className="w-full max-w-xs">
            <div className="mb-2 flex justify-between text-sm font-semibold text-[#6B7280]">
              <span>Professional Identity</span>
              <span>{professionalIdentityPercent}% complete</span>
            </div>
            <ProgressBar value={professionalIdentityPercent} />
          </div>
        </div>
      </section>

      <section aria-label="PATHZY Home" className="grid gap-5">
        <HomeCard
          eyebrow="Continue"
          title="Continue Your Employment Journey"
          primaryHref={nextAction.destinationRoute}
          primaryLabel="Continue"
          secondaryHref={appRoutes.professionalIdentity}
          secondaryLabel="Review Profile"
        >
          <p className="font-medium text-[#111827]">{nextAction.label}</p>
          <p className="mt-2">{nextAction.reason}</p>
          <div className="mt-5 max-w-xl">
            <div className="mb-2 flex justify-between text-sm font-medium text-[#6B7280]">
              <span>Journey progress</span>
              <span>{nextAction.progressPercent}%</span>
            </div>
            <ProgressBar value={nextAction.progressPercent} />
          </div>
        </HomeCard>

        <HomeCard
          eyebrow="Employment Center"
          title="Employment Center"
          primaryHref={appRoutes.employmentCenter}
          primaryLabel="Open Employment Center"
          secondaryHref={appRoutes.documents}
          secondaryLabel="Open Documents"
        >
          <p>
            Build and manage the professional evidence employers see: your profile, CV, cover letter, LinkedIn content, and supporting documents.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Professional Identity", "CV", "Cover Letter", "LinkedIn"].map((item) => (
              <span key={item} className="rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1 text-sm font-medium text-[#6B7280]">{item}</span>
            ))}
          </div>
        </HomeCard>

        <HomeCard
          eyebrow="Jobs"
          title="Opportunities"
          primaryHref={appRoutes.opportunities}
          primaryLabel="Find Opportunities"
        >
          <p>
            Compare roles, understand what employers require, prepare applications, and keep every next action visible.
          </p>
          <p className="mt-3 text-sm font-medium text-[#111827]">
            {applicationSummary.activeApplications} active applications · {applicationSummary.followUpsDue} follow-ups due · {applicationSummary.interviews} interviews
          </p>
        </HomeCard>

        <HomeCard
          eyebrow="Guidance"
          title="Insights & Coach"
          primaryHref={appRoutes.mentor}
          primaryLabel="Ask Coach"
          secondaryHref={appRoutes.careerAnalytics}
          secondaryLabel="View Insights"
        >
          <p>
            Get practical guidance based on your profile, documents, job matches, applications, interviews, and follow-ups.
          </p>
          <p className="mt-3 text-sm font-medium text-[#111827]">
            {topInsight?.reason ?? "Keep using PATHZY and your insights will become more specific over time."}
          </p>
        </HomeCard>
      </section>
    </main>
  );
}
