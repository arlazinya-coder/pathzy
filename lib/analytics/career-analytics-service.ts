import { applicationMatchesTrackerView, normalizeApplicationStatus } from "@/lib/applications/application-tracker-service";
import type { ApplicationTrackerRow } from "@/lib/applications/application-tracker-service";
import { appRoutes } from "@/lib/navigation/routes";

export type AnalyticsPeriod = "7d" | "30d" | "90d" | "year" | "custom";

export type CareerAnalyticsApplication = ApplicationTrackerRow & {
  source?: string | null;
  job_match_analysis_id?: string | null;
  match_summary_json?: Record<string, unknown> | null;
};

export type CareerAnalyticsTimelineEvent = {
  id: string;
  application_id: string;
  event_type: string;
  event_at: string;
};

export type CareerAnalyticsJobMatch = {
  id: string;
  gaps_json?: Array<Record<string, unknown>> | null;
  requirement_matches_json?: Array<Record<string, unknown>> | null;
  recommendations_json?: Array<Record<string, unknown>> | null;
  created_at?: string | null;
};

export type CareerAnalyticsDocument = {
  id: string;
  name?: string | null;
  document_type?: string | null;
  template_id?: string | null;
  target_role?: string | null;
  updated_at?: string | null;
};

export type CareerAnalyticsInput = {
  applications: CareerAnalyticsApplication[];
  timelineEvents?: CareerAnalyticsTimelineEvent[];
  matchAnalyses?: CareerAnalyticsJobMatch[];
  professionalDocuments?: CareerAnalyticsDocument[];
  period?: {
    type: AnalyticsPeriod;
    start?: string;
    end?: string;
  };
  timezone?: string;
  now?: Date;
};

export type AnalyticsMetric = {
  label: string;
  value: string;
  state: "known" | "insufficient_data" | "early_signal" | "unknown";
  detail: string;
};

export type CareerAnalyticsGroup = {
  label: string;
  applications: number;
  responses: number;
  interviews: number;
  offers: number;
  signal: "not_enough_data" | "early_signal" | "known";
  note: string;
};

export type RecurringGap = {
  label: string;
  count: number;
  category: "confirmed_gap" | "evidence_gap" | "presentation_gap" | "qualification_gap" | "experience_gap";
  action: string;
};

export type DocumentSignal = CareerAnalyticsGroup & {
  documentId: string;
  documentName: string;
};

export type CareerAnalyticsResult = {
  methodology: string[];
  period: { start: string; end: string; timezone: string; type: AnalyticsPeriod };
  funnel: Record<"prepared" | "applied" | "employer_response" | "screening" | "assessment" | "interview" | "offer" | "accepted", number>;
  metrics: {
    responseRate: AnalyticsMetric;
    interviewRate: AnalyticsMetric;
    offerRate: AnalyticsMetric;
    averageDaysToResponse: AnalyticsMetric;
    averageDaysToInterview: AnalyticsMetric;
  };
  byRole: CareerAnalyticsGroup[];
  bySource: CareerAnalyticsGroup[];
  documentSignals: DocumentSignal[];
  recurringGaps: RecurringGap[];
  recommendedActions: Array<{ label: string; reason: string; route?: string }>;
  dataWarnings: string[];
};

const responseStatuses = new Set(["viewed", "screening", "assessment", "interview_scheduled", "interview_completed", "offer_received", "offer_accepted", "offer_declined", "rejected", "withdrawn", "closed"]);
const screeningStatuses = new Set(["screening", "assessment", "interview_scheduled", "interview_completed", "offer_received", "offer_accepted", "offer_declined"]);
const assessmentStatuses = new Set(["assessment", "interview_scheduled", "interview_completed", "offer_received", "offer_accepted", "offer_declined"]);
const interviewStatuses = new Set(["interview_scheduled", "interview_completed", "offer_received", "offer_accepted", "offer_declined"]);
const offerStatuses = new Set(["offer_received", "offer_accepted", "offer_declined"]);

function toDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(start: Date, end: Date) {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

function safeLabel(value: string | null | undefined, fallback: string) {
  const clean = value?.trim();
  return clean || fallback;
}

function normalizeSource(source: string | null | undefined) {
  const clean = source?.trim().toLowerCase() ?? "";
  if (!clean) return "Not recorded";
  if (clean.includes("linkedin")) return "LinkedIn";
  if (clean.includes("referral")) return "Referral";
  if (clean.includes("recruiter")) return "Recruiter";
  if (clean.includes("pathzy")) return "PATHZY opportunity feed";
  if (clean.includes("company") || clean.includes("website")) return "Company website";
  if (clean.includes("email")) return "Direct email";
  if (clean.includes("board") || clean.includes("indeed") || clean.includes("career")) return "Job board";
  return source?.trim() ?? "Not recorded";
}

function periodRange(input: CareerAnalyticsInput) {
  const now = input.now ?? new Date();
  const end = toDate(input.period?.end) ?? now;
  const start = toDate(input.period?.start) ?? new Date(end);
  if (input.period?.type === "7d") start.setUTCDate(end.getUTCDate() - 7);
  else if (input.period?.type === "30d") start.setUTCDate(end.getUTCDate() - 30);
  else if (input.period?.type === "90d") start.setUTCDate(end.getUTCDate() - 90);
  else if (input.period?.type === "year") start.setUTCMonth(0, 1);
  else if (!input.period?.start) start.setUTCDate(end.getUTCDate() - 90);
  return { start, end, type: input.period?.type ?? "90d", timezone: input.timezone ?? "UTC" };
}

function applicationDate(application: CareerAnalyticsApplication) {
  return toDate(application.application_date) ?? toDate(application.planned_application_date) ?? toDate(application.updated_at) ?? toDate(application.created_at);
}

function isInPeriod(application: CareerAnalyticsApplication, start: Date, end: Date) {
  const date = applicationDate(application);
  if (!date) return true;
  return date >= start && date <= end;
}

function isPrepared(application: CareerAnalyticsApplication) {
  const status = normalizeApplicationStatus(application.status);
  return status !== "planning" || Boolean(application.targeted_cv_document_id || application.cover_letter_document_id);
}

function hasResponse(application: CareerAnalyticsApplication) {
  return responseStatuses.has(normalizeApplicationStatus(application.status));
}

function hasInterview(application: CareerAnalyticsApplication) {
  return interviewStatuses.has(normalizeApplicationStatus(application.status)) || Boolean(application.interview_date);
}

function hasOffer(application: CareerAnalyticsApplication) {
  return offerStatuses.has(normalizeApplicationStatus(application.status));
}

function metric(label: string, numerator: number, denominator: number, detail: string): AnalyticsMetric {
  if (denominator <= 0) return { label, value: "Not Enough Data Yet", state: "insufficient_data", detail };
  const percent = Math.round((numerator / denominator) * 100);
  return {
    label,
    value: `${percent}%`,
    state: denominator < 5 ? "early_signal" : "known",
    detail: denominator < 5 ? `${detail} This is an early signal from ${denominator} known outcome${denominator === 1 ? "" : "s"}.` : detail
  };
}

function averageMetric(label: string, values: number[], detail: string): AnalyticsMetric {
  if (!values.length) return { label, value: "Not Enough Data Yet", state: "insufficient_data", detail };
  const average = Math.round(values.reduce((sum, item) => sum + item, 0) / values.length);
  return {
    label,
    value: `${average} day${average === 1 ? "" : "s"}`,
    state: values.length < 3 ? "early_signal" : "known",
    detail: values.length < 3 ? `${detail} This is an early signal from ${values.length} known record${values.length === 1 ? "" : "s"}.` : detail
  };
}

function firstEventDate(events: CareerAnalyticsTimelineEvent[], applicationId: string, eventTypes: string[]) {
  const types = new Set(eventTypes);
  return events
    .filter((event) => event.application_id === applicationId && types.has(event.event_type))
    .map((event) => toDate(event.event_at))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => a.getTime() - b.getTime())[0] ?? null;
}

function groupApplications(applications: CareerAnalyticsApplication[], labelFor: (application: CareerAnalyticsApplication) => string): CareerAnalyticsGroup[] {
  const groups = new Map<string, CareerAnalyticsApplication[]>();
  for (const application of applications) {
    const label = labelFor(application);
    groups.set(label, [...(groups.get(label) ?? []), application]);
  }
  return [...groups.entries()]
    .map(([label, items]) => {
      const responses = items.filter(hasResponse).length;
      const interviews = items.filter(hasInterview).length;
      const offers = items.filter(hasOffer).length;
      return {
        label,
        applications: items.length,
        responses,
        interviews,
        offers,
        signal: items.length < 3 ? "not_enough_data" as const : "early_signal" as const,
        note: items.length < 3 ? "Not enough data yet. Do not make career decisions from this sample." : "Early signal. Compare cautiously and keep context in mind."
      };
    })
    .sort((a, b) => b.applications - a.applications || b.interviews - a.interviews)
    .slice(0, 8);
}

function classifyGap(label: string, match: Record<string, unknown>): RecurringGap["category"] {
  const text = `${label} ${String(match.requirementType ?? "")} ${String(match.title ?? "")}`.toLowerCase();
  if (text.includes("qualification") || text.includes("degree") || text.includes("education")) return "qualification_gap";
  if (text.includes("experience") || text.includes("years")) return "experience_gap";
  if (text.includes("presentation") || text.includes("cv") || text.includes("show")) return "presentation_gap";
  if (String(match.status ?? "").includes("not_confirmed") || text.includes("evidence")) return "evidence_gap";
  return "confirmed_gap";
}

function recurringGaps(matchAnalyses: CareerAnalyticsJobMatch[]) {
  const gapMap = new Map<string, RecurringGap>();
  for (const analysis of matchAnalyses) {
    const gaps = [...(analysis.gaps_json ?? []), ...(analysis.requirement_matches_json ?? []).filter((match) => ["confirmed_gap", "not_confirmed", "partial_match"].includes(String(match.status)))];
    for (const gap of gaps) {
      const label = safeLabel(String(gap.requirementText ?? gap.title ?? gap.description ?? gap.label ?? ""), "Requirement to review");
      const key = label.toLowerCase();
      const category = classifyGap(label, gap);
      const existing = gapMap.get(key);
      gapMap.set(key, {
        label,
        count: (existing?.count ?? 0) + 1,
        category: existing?.category ?? category,
        action: category === "presentation_gap" ? "Improve how this evidence appears in your CV." : category === "evidence_gap" ? "Add verified evidence to your Professional Profile." : "Plan a truthful next step before applying to similar roles."
      });
    }
  }
  return [...gapMap.values()].sort((a, b) => b.count - a.count).slice(0, 8);
}

function documentSignals(applications: CareerAnalyticsApplication[], professionalDocuments: CareerAnalyticsDocument[]) {
  const documentNames = new Map(professionalDocuments.map((document) => [document.id, document.name ?? document.target_role ?? "CV version"]));
  const groups = new Map<string, CareerAnalyticsApplication[]>();
  for (const application of applications) {
    if (!application.targeted_cv_document_id) continue;
    groups.set(application.targeted_cv_document_id, [...(groups.get(application.targeted_cv_document_id) ?? []), application]);
  }
  return [...groups.entries()].map(([documentId, items]) => {
    const responses = items.filter(hasResponse).length;
    const interviews = items.filter(hasInterview).length;
    const offers = items.filter(hasOffer).length;
    return {
      documentId,
      documentName: documentNames.get(documentId) ?? "CV version",
      label: documentNames.get(documentId) ?? "CV version",
      applications: items.length,
      responses,
      interviews,
      offers,
      signal: items.length < 3 ? "not_enough_data" as const : "early_signal" as const,
      note: items.length < 3
        ? "Not enough data yet. PATHZY will not claim this version performs better from a small sample."
        : "Early signal only. Applications using this CV version have received more interview responses so far, but this does not prove causation."
    };
  }).sort((a, b) => b.interviews - a.interviews || b.responses - a.responses).slice(0, 6);
}

export function buildCareerAnalytics(input: CareerAnalyticsInput): CareerAnalyticsResult {
  const range = periodRange(input);
  const applications = input.applications.filter((application) => isInPeriod(application, range.start, range.end));
  const applied = applications.filter((application) => applicationMatchesTrackerView(application, "applied") || responseStatuses.has(normalizeApplicationStatus(application.status)) || offerStatuses.has(normalizeApplicationStatus(application.status)));
  const responses = applications.filter(hasResponse);
  const interviews = applications.filter(hasInterview);
  const offers = applications.filter(hasOffer);
  const accepted = applications.filter((application) => normalizeApplicationStatus(application.status) === "offer_accepted");
  const timelineEvents = input.timelineEvents ?? [];
  const responseDays = responses
    .map((application) => {
      const start = toDate(application.application_date);
      const responseDate = firstEventDate(timelineEvents, application.id, ["viewed", "screening", "assessment_received", "interview_invited", "interview_scheduled", "offer", "rejection"]) ?? toDate(application.updated_at);
      return start && responseDate ? daysBetween(start, responseDate) : null;
    })
    .filter((value): value is number => value !== null);
  const interviewDays = interviews
    .map((application) => {
      const start = toDate(application.application_date);
      const interviewDate = toDate(application.interview_date) ?? firstEventDate(timelineEvents, application.id, ["interview_invited", "interview_scheduled", "interview_completed"]);
      return start && interviewDate ? daysBetween(start, interviewDate) : null;
    })
    .filter((value): value is number => value !== null);
  const gaps = recurringGaps(input.matchAnalyses ?? []);
  const sourceGroups = groupApplications(applications, (application) => normalizeSource(application.source));
  const roleGroups = groupApplications(applications, (application) => safeLabel(application.role, "Role not recorded"));
  const followUpsDue = applications.filter((application) => applicationMatchesTrackerView(application, "follow_up_needed")).length;

  const recommendedActions = [
    ...gaps.slice(0, 2).map((gap) => ({
      label: gap.category === "presentation_gap" ? "Improve how your evidence is presented" : "Add verified evidence",
      reason: `${gap.label} appears across ${gap.count} job match ${gap.count === 1 ? "analysis" : "analyses"}.`,
      route: appRoutes.professionalIdentity
    })),
    ...(documentSignals(applications, input.professionalDocuments ?? []).length ? [{
      label: "Create or review a role-specific CV",
      reason: "Compare early signals cautiously and keep tailoring documents for each suitable role.",
      route: appRoutes.professionalIdentityCv
    }] : []),
    ...(followUpsDue ? [{
      label: "Review follow-ups",
      reason: `${followUpsDue} application${followUpsDue === 1 ? " has" : "s have"} a follow-up or next action due.`,
      route: appRoutes.applications
    }] : []),
    ...(interviews.length ? [{
      label: "Practise recurring interview questions",
      reason: "Interview activity is visible in your tracker. Prepare with job-specific evidence.",
      route: appRoutes.interview
    }] : [])
  ].slice(0, 6);

  return {
    methodology: [
      "Unknown outcomes are not counted as rejection.",
      "Conversion rates use only known tracker states and are marked as early signals for small samples.",
      "Document performance is correlation only. PATHZY does not claim a CV version caused an outcome.",
      "Private notes, contacts, interview responses and document contents are excluded from analytics."
    ],
    period: { start: dateOnly(range.start), end: dateOnly(range.end), timezone: range.timezone, type: range.type },
    funnel: {
      prepared: applications.filter(isPrepared).length,
      applied: applied.length,
      employer_response: responses.length,
      screening: applications.filter((application) => screeningStatuses.has(normalizeApplicationStatus(application.status))).length,
      assessment: applications.filter((application) => assessmentStatuses.has(normalizeApplicationStatus(application.status))).length,
      interview: interviews.length,
      offer: offers.length,
      accepted: accepted.length
    },
    metrics: {
      responseRate: metric("Response Rate", responses.length, applied.length, "Responses are counted only when the tracker has viewed, screening, assessment, interview, offer, rejection, withdrawal, or closed states."),
      interviewRate: metric("Interview Rate", interviews.length, applied.length, "Interviews are counted only from interview statuses or saved interview dates."),
      offerRate: metric("Offer Rate", offers.length, interviews.length || applied.length, "Offer rate uses interview records when available, otherwise applied applications with known outcomes."),
      averageDaysToResponse: averageMetric("Average days to response", responseDays, "Average response time uses applied date to the first response timeline event when available."),
      averageDaysToInterview: averageMetric("Average days to interview", interviewDays, "Average interview time uses applied date to saved interview date or interview timeline event.")
    },
    byRole: roleGroups,
    bySource: sourceGroups,
    documentSignals: documentSignals(applications, input.professionalDocuments ?? []),
    recurringGaps: gaps,
    recommendedActions,
    dataWarnings: [
      ...(applications.length < 5 ? ["Not Enough Data Yet: PATHZY will show early signals without telling you to abandon a career direction."] : []),
      ...(applied.length && responses.length < applied.length ? ["Some application outcomes are still unknown. They are not treated as rejection."] : []),
      "Analytics are private and do not create public benchmarking."
    ]
  };
}
