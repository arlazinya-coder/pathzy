import Link from "next/link";
import { PathzyTimeline } from "@/components/journey/pathzy-timeline";
import { ButtonLink, Card, ProgressBar } from "@/components/ui";
import { summarizeApplicationTracker } from "@/lib/applications/application-tracker-service";
import { buildCareerAnalytics } from "@/lib/analytics/career-analytics-service";
import { appRoutes } from "@/lib/navigation/routes";
import {
  buildCareerPlanSuggestions,
  buildDashboardAttentionItems,
  buildUnifiedTimelineSignals,
  PATHZY_OPERATING_AREAS
} from "@/lib/operating-system/employment-operating-system";
import { getProgressMilestones, getProgressPercent, type ProgressInputs } from "@/lib/progress/progress-engine";
import { getPathzyNextAction, type PathzyNextAction } from "@/lib/progress/next-action-engine";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

const dashboardActions = [
  {
    eyebrow: "WELCOME TO PATHZY",
    title: "Your employment journey, guided step by step",
    question: "",
    body: "PATHZY is your employment support system.\n\nWe guide you step by step — from building your professional profile and CV to preparing for opportunities and moving toward employment.\n\nYou don't need to figure out everything at once. Start with the next step, and PATHZY will help you move forward from there.",
    button: "",
    href: ""
  },
  {
    eyebrow: "TODAY'S RECOMMENDATION",
    title: "Build your CV",
    question: "Do you need a new CV?",
    body: "A professional CV is the foundation of every successful job application. PATHZY can help you build yours step by step.",
    button: "Build My CV",
    href: `${appRoutes.professionalIdentityCv}?intent=build`
  },
  {
    eyebrow: "ALREADY HAVE AN OLD CV?",
    title: "Upload and improve your CV",
    question: "",
    body: "Upload your existing PDF or Word CV.\n\nPATHZY will read and organise your information, help you improve it and transform it into a premium PATHZY CV.",
    button: "Upload My Old CV",
    href: `${appRoutes.professionalIdentityCv}?intent=upload`
  },
  {
    eyebrow: "IMPROVE YOUR PATHZY CV",
    title: "Update your information",
    question: "Already created a CV with PATHZY?",
    body: "Add new experience, education, skills, certifications, projects or achievements to keep your CV up to date.",
    button: "Upgrade My CV",
    href: `${appRoutes.professionalIdentityCv}?intent=upgrade`
  }
] as const;

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

async function safeQuery<T>(label: string, query: PromiseLike<{ data: T | null; error: { message?: string } | null }>, fallback: T): Promise<T> {
  try {
    const { data, error } = await query;
    if (error) {
      console.warn(`[pathzy-operating-system] ${label} unavailable`, error.message ?? error);
      return fallback;
    }
    return data ?? fallback;
  } catch (error) {
    console.warn(`[pathzy-operating-system] ${label} failed`, error);
    return fallback;
  }
}

export default async function RoadmapPage() {
  const { user, supabase } = await requireAuthenticatedUser(appRoutes.roadmap);
  const [profile, nextAction, applications, timelineEvents, matchAnalyses, professionalDocuments] = await Promise.all([
    safeQuery<{ full_name?: string | null } | null>(
      "profile",
      supabase
        .from("user_profiles")
        .select("full_name")
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle(),
      null
    ),
    getPathzyNextAction(supabase, user).catch((error) => {
      console.warn("[pathzy-operating-system] next action fallback", error);
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
  const applicationSummary = summarizeApplicationTracker(applications as never[]);
  const analytics = buildCareerAnalytics({
    applications: applications as never[],
    timelineEvents: timelineEvents as never[],
    matchAnalyses: matchAnalyses as never[],
    professionalDocuments: professionalDocuments as never[],
    period: { type: "90d" },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC"
  });
  const attentionItems = buildDashboardAttentionItems({ nextAction, applicationSummary, analytics });
  const careerPlanSuggestions = buildCareerPlanSuggestions(analytics);
  const timelineSignals = buildUnifiedTimelineSignals(applications as never[]);

  return (
    <main className="container page-pad">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_24px_80px_rgba(37,70,180,0.18)] sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#5B8CFF]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-8 h-48 w-48 rounded-full bg-[#9D7CFF]/18 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#9db8ff]">Welcome back to PATHZY</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">
            Welcome, {firstName}
          </h1>
          <p className="mt-4 text-xl font-extrabold text-[#dfe8ff]">Let's take the next step toward your employment goals.</p>
          <p className="mt-4 text-base leading-7 text-white/68 sm:text-lg">
            Start with your CV, and PATHZY will guide you through the process.
          </p>
        </div>
      </section>

      <section aria-labelledby="operating-system-heading" className="mt-6 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <Card className="bg-white/7">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#c7d6ff]">Continue Journey</p>
          <h2 id="operating-system-heading" className="mt-3 text-3xl font-black leading-tight">One clear next step</h2>
          <p className="mt-3 text-2xl font-black text-white">{nextAction.label}</p>
          <p className="mt-3 leading-7 text-white/62">{nextAction.reason}</p>
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm font-bold text-white/52">
              <span>Employment journey progress</span>
              <span>{nextAction.progressPercent}%</span>
            </div>
            <ProgressBar value={nextAction.progressPercent} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={nextAction.destinationRoute}>Continue</ButtonLink>
            <ButtonLink href={appRoutes.mentor} variant="secondary">Ask Coach</ButtonLink>
          </div>
        </Card>

        <Card className="bg-white/6">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/42">What needs attention</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {attentionItems.map((item) => (
              <Link key={item.label} href={item.href} className="rounded-[18px] border border-white/10 bg-black/14 p-4 transition hover:border-[#5B8CFF]/45 hover:bg-white/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8fb0ff]">
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/38">{item.label}</p>
                <strong className="mt-2 block text-xl font-black">{item.value}</strong>
                <p className="mt-2 text-sm leading-6 text-white/54">{item.detail}</p>
              </Link>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <PathzyTimeline milestones={nextAction.milestones} current={nextAction.milestone} progress={nextAction.progressPercent} />
      </section>

      <section aria-labelledby="career-insights-heading" className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="bg-white/6">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/42">Career Insights</p>
          <h2 id="career-insights-heading" className="mt-3 text-3xl font-black">Private signals from your applications</h2>
          <p className="mt-3 leading-7 text-white/58">PATHZY uses tracker metadata and job-match gaps only. Unknown outcomes are not counted as rejection.</p>
          <div className="mt-4 grid gap-3">
            {analytics.recommendedActions.length ? analytics.recommendedActions.slice(0, 3).map((action) => (
              <Link key={`${action.label}-${action.reason}`} href={action.route ?? appRoutes.applications} className="rounded-[16px] border border-white/10 bg-black/14 p-4 transition hover:border-[#5B8CFF]/45">
                <p className="font-black">{action.label}</p>
                <p className="mt-2 text-sm leading-6 text-white/52">{action.reason}</p>
              </Link>
            )) : (
              <p className="rounded-[16px] border border-dashed border-white/12 bg-black/14 p-4 text-sm leading-6 text-white/52">Not enough analytics yet. Track applications, follow-ups, interviews, and outcomes so PATHZY can show useful patterns.</p>
            )}
          </div>
        </Card>

        <Card className="bg-white/6">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/42">Career Plan Suggestions</p>
          <h2 className="mt-3 text-3xl font-black">Improve the plan without changing it for you</h2>
          <p className="mt-3 leading-7 text-white/58">PATHZY can suggest evidence-backed improvements from recurring gaps, interviews, and outcomes. You stay in control.</p>
          <div className="mt-4 grid gap-3">
            {careerPlanSuggestions.length ? careerPlanSuggestions.map((suggestion) => (
              <Link key={`${suggestion.label}-${suggestion.reason}`} href={suggestion.href} className="rounded-[16px] border border-white/10 bg-black/14 p-4 transition hover:border-[#5B8CFF]/45">
                <p className="font-black">{suggestion.label}</p>
                <p className="mt-2 text-sm leading-6 text-white/52">{suggestion.reason}</p>
              </Link>
            )) : (
              <p className="rounded-[16px] border border-dashed border-white/12 bg-black/14 p-4 text-sm leading-6 text-white/52">No recurring gaps yet. Keep building your profile, documents, and tracked applications.</p>
            )}
          </div>
        </Card>
      </section>

      <section aria-labelledby="cv-actions-heading" className="mt-6">
        <h2 id="cv-actions-heading" className="sr-only">Choose how to work on your CV</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {dashboardActions.map((action) => (
            <Card
              key={action.eyebrow}
              className="bg-white/6"
            >
              <div className="flex h-full flex-col">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#c7d6ff]">{action.eyebrow}</p>
                <h3 className="mt-4 text-3xl font-black leading-tight text-white">{action.title}</h3>
                {action.question ? <p className="mt-3 text-base font-extrabold text-white/82">{action.question}</p> : null}
                <div className="mt-3 space-y-3 text-sm leading-6 text-white/66 sm:text-base">
                  {action.body.split("\n\n").map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {action.button && action.href ? (
                  <div className="mt-6 pt-1 sm:mt-auto sm:pt-6">
                    <ButtonLink href={action.href}>{action.button}</ButtonLink>
                  </div>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="workspace-heading" className="mt-6">
        <Card className="bg-white/6">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/42">PATHZY Workspace</p>
          <h2 id="workspace-heading" className="mt-3 text-3xl font-black">One platform from profile to employment</h2>
          <p className="mt-3 max-w-3xl leading-7 text-white/58">Every area uses the same professional identity, document engine, job intelligence, tracker, timeline, analytics, and Coach context.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PATHZY_OPERATING_AREAS.filter((area) => area.key !== "home").map((area) => (
              <Link key={area.key} href={area.href} className="rounded-[18px] border border-white/10 bg-black/14 p-4 transition hover:border-[#5B8CFF]/45 hover:bg-white/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8fb0ff]">
                <p className="text-lg font-black">{area.label}</p>
                <p className="mt-2 text-sm leading-6 text-white/54">{area.description}</p>
              </Link>
            ))}
          </div>
          {timelineSignals.length ? (
            <div className="mt-5 rounded-[18px] border border-white/10 bg-black/14 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Recent application timeline signals</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {timelineSignals.slice(0, 5).map((signal) => (
                  <span key={signal.key} className="rounded-full border border-white/10 bg-white/7 px-3 py-2 text-xs font-bold text-white/58">
                    {signal.label}: {signal.nextAction}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      </section>
    </main>
  );
}
