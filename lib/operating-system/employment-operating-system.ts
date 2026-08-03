import { applicationEventsForPathzyTimeline, type ApplicationTrackerRow, type ApplicationTrackerSummary } from "@/lib/applications/application-tracker-service";
import type { CareerAnalyticsResult } from "@/lib/analytics/career-analytics-service";
import { appRoutes } from "@/lib/navigation/routes";
import type { PathzyNextAction } from "@/lib/progress/next-action-engine";

export type PathzyOperatingArea = {
  key: "home" | "professional_identity" | "documents" | "jobs" | "applications" | "interview" | "career_plan" | "career_analytics" | "coach" | "settings";
  label: string;
  href: string;
  description: string;
  includeInNavigation: boolean;
};

export const PATHZY_OPERATING_AREAS = [
  {
    key: "home",
    label: "Home",
    href: appRoutes.roadmap,
    description: "See where you are, what needs attention, and the next step toward employment.",
    includeInNavigation: true
  },
  {
    key: "professional_identity",
    label: "Professional Identity",
    href: appRoutes.professionalIdentity,
    description: "Confirm the profile evidence PATHZY uses for documents, jobs, applications, and coaching.",
    includeInNavigation: true
  },
  {
    key: "documents",
    label: "Employment Center",
    href: appRoutes.employmentCenter,
    description: "Create, preview, save, and manage employment tools from the same professional identity.",
    includeInNavigation: true
  },
  {
    key: "jobs",
    label: "Jobs",
    href: appRoutes.opportunities,
    description: "Find, import, analyse, and understand job opportunities before applying.",
    includeInNavigation: true
  },
  {
    key: "applications",
    label: "Applications",
    href: appRoutes.applications,
    description: "Prepare, submit, track, follow up, and review every application in one operational view.",
    includeInNavigation: true
  },
  {
    key: "interview",
    label: "Interview Preparation",
    href: appRoutes.interview,
    description: "Prepare job-specific questions, STAR stories, gap responses, and safe practice feedback.",
    includeInNavigation: true
  },
  {
    key: "career_plan",
    label: "Career Plan",
    href: appRoutes.roadmap,
    description: "Use evidence-backed next steps without PATHZY changing your plan automatically.",
    includeInNavigation: true
  },
  {
    key: "career_analytics",
    label: "Career Analytics",
    href: appRoutes.careerAnalytics,
    description: "Review private job-search signals, recurring gaps, and practical recommendations.",
    includeInNavigation: true
  },
  {
    key: "coach",
    label: "Coach",
    href: appRoutes.mentor,
    description: "Ask PATHZY for guidance using shared profile, document, job, application, and interview context.",
    includeInNavigation: true
  },
  {
    key: "settings",
    label: "Settings",
    href: appRoutes.settings,
    description: "Manage account, language, access, and preferences.",
    includeInNavigation: true
  }
] as const satisfies readonly PathzyOperatingArea[];

export function getOperatingNavigation() {
  return PATHZY_OPERATING_AREAS
    .filter((area) => area.includeInNavigation)
    .map((area) => ({ label: area.label, href: area.href }));
}

export function buildDashboardAttentionItems({
  nextAction,
  applicationSummary,
  analytics
}: {
  nextAction: PathzyNextAction;
  applicationSummary: ApplicationTrackerSummary;
  analytics: CareerAnalyticsResult;
}) {
  return [
    {
      label: "Professional Identity",
      value: `${nextAction.progressPercent}%`,
      detail: nextAction.progressPercent >= 100 ? "Profile and journey foundations are complete." : nextAction.reason,
      href: appRoutes.professionalIdentity
    },
    {
      label: "Documents",
      value: nextAction.progressInputs.cvComplete ? "CV ready" : "CV needed",
      detail: nextAction.progressInputs.cvComplete ? "Keep your documents aligned with real jobs." : "Create your CV before preparing applications.",
      href: appRoutes.professionalIdentityCv
    },
    {
      label: "Applications",
      value: `${applicationSummary.activeApplications}`,
      detail: applicationSummary.nextAction.label,
      href: appRoutes.applications
    },
    {
      label: "Follow-Ups",
      value: `${applicationSummary.followUpsDue}`,
      detail: applicationSummary.followUpsDue ? "Review due follow-ups before they become stale." : "No due follow-ups right now.",
      href: appRoutes.careerAnalytics
    },
    {
      label: "Interviews",
      value: `${applicationSummary.interviews}`,
      detail: applicationSummary.interviews ? "Prepare with job-specific evidence." : "Interview prep unlocks once applications create real context.",
      href: appRoutes.interview
    },
    {
      label: "Career Insights",
      value: analytics.recommendedActions.length ? "Ready" : "Learning",
      detail: analytics.recommendedActions[0]?.reason ?? "Continue tracking applications so PATHZY can identify useful patterns.",
      href: appRoutes.careerAnalytics
    }
  ];
}

export function buildCareerPlanSuggestions(analytics: CareerAnalyticsResult) {
  const gapSuggestions = analytics.recurringGaps.slice(0, 3).map((gap) => ({
    label: gap.label,
    reason: gap.action,
    href: appRoutes.professionalIdentity
  }));

  return [
    ...gapSuggestions,
    ...analytics.recommendedActions.slice(0, 3).map((action) => ({
      label: action.label,
      reason: action.reason,
      href: action.route ?? appRoutes.roadmap
    }))
  ].slice(0, 4);
}

export function buildUnifiedTimelineSignals(applications: ApplicationTrackerRow[]) {
  return applicationEventsForPathzyTimeline(applications);
}
