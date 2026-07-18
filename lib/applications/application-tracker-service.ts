import type { ApplicationTimelineEventType, ApplicationTrackerView, SmartApplicationStatus } from "./smart-application.types";

export const APPLICATION_TRACKER_STATUSES = [
  "planning",
  "preparing",
  "ready_to_apply",
  "applied",
  "viewed",
  "screening",
  "assessment",
  "interview_scheduled",
  "interview_completed",
  "offer_received",
  "offer_accepted",
  "offer_declined",
  "rejected",
  "withdrawn",
  "closed",
  "archived"
] as const satisfies readonly SmartApplicationStatus[];

export const LEGACY_APPLICATION_STATUSES = ["saved", "preparing_documents", "review_required", "interview", "offer", "accepted"] as const;

export const APPLICATION_TRACKER_VIEWS = [
  "all",
  "preparing",
  "ready_to_apply",
  "applied",
  "interviews",
  "offers",
  "follow_up_needed",
  "closed"
] as const satisfies readonly ApplicationTrackerView[];

export const APPLICATION_TIMELINE_EVENT_TYPES = [
  "application_created",
  "documents_prepared",
  "ready_to_apply",
  "applied",
  "viewed",
  "screening",
  "assessment_received",
  "interview_invited",
  "interview_scheduled",
  "interview_completed",
  "follow_up",
  "offer",
  "rejection",
  "withdrawal",
  "note",
  "document_update",
  "status_change"
] as const satisfies readonly ApplicationTimelineEventType[];

export type ApplicationTrackerStatus = (typeof APPLICATION_TRACKER_STATUSES)[number];

export type ApplicationTrackerRow = {
  id: string;
  company_name?: string | null;
  role?: string | null;
  opportunity_type?: string | null;
  status?: string | null;
  application_date?: string | null;
  follow_up_date?: string | null;
  closing_date?: string | null;
  planned_application_date?: string | null;
  assessment_deadline?: string | null;
  interview_date?: string | null;
  expected_response_date?: string | null;
  next_action_date?: string | null;
  next_action?: string | null;
  notes?: string | null;
  targeted_cv_document_id?: string | null;
  cover_letter_document_id?: string | null;
  optional_message_ids_json?: string[] | null;
  supporting_document_ids_json?: string[] | null;
  job_match_analysis_id?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export type ApplicationTrackerSummary = {
  activeApplications: number;
  followUpsDue: number;
  interviews: number;
  latestApplication: ApplicationTrackerRow | null;
  nextAction: {
    label: string;
    applicationId?: string;
    dueDate?: string | null;
  };
};

const normalStatusMap: Record<string, ApplicationTrackerStatus> = {
  saved: "planning",
  planning: "planning",
  preparing_documents: "preparing",
  review_required: "preparing",
  preparing: "preparing",
  ready_to_apply: "ready_to_apply",
  applied: "applied",
  viewed: "viewed",
  screening: "screening",
  assessment: "assessment",
  interview: "interview_scheduled",
  interview_scheduled: "interview_scheduled",
  interview_completed: "interview_completed",
  offer: "offer_received",
  offer_received: "offer_received",
  accepted: "offer_accepted",
  offer_accepted: "offer_accepted",
  offer_declined: "offer_declined",
  rejected: "rejected",
  withdrawn: "withdrawn",
  closed: "closed",
  archived: "archived"
};

const statusOrder: ApplicationTrackerStatus[] = [
  "planning",
  "preparing",
  "ready_to_apply",
  "applied",
  "viewed",
  "screening",
  "assessment",
  "interview_scheduled",
  "interview_completed",
  "offer_received",
  "offer_accepted",
  "offer_declined",
  "rejected",
  "withdrawn",
  "closed",
  "archived"
];

const terminalStatuses = new Set<ApplicationTrackerStatus>(["offer_accepted", "offer_declined", "rejected", "withdrawn", "closed", "archived"]);

export function normalizeApplicationStatus(status: string | null | undefined): ApplicationTrackerStatus {
  return normalStatusMap[String(status ?? "planning")] ?? "planning";
}

export function labelApplicationStatus(status: string | null | undefined) {
  const normalized = normalizeApplicationStatus(status);
  return normalized.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function isApplicationActive(status: string | null | undefined) {
  const normalized = normalizeApplicationStatus(status);
  return !terminalStatuses.has(normalized);
}

export function canTransitionApplicationStatus(from: string | null | undefined, to: string | null | undefined, options: { correction?: boolean } = {}) {
  const current = normalizeApplicationStatus(from);
  const target = normalizeApplicationStatus(to);
  if (current === target) return true;
  if (options.correction) return true;
  if (target === "archived") return true;
  if (terminalStatuses.has(current)) return false;
  return statusOrder.indexOf(target) >= statusOrder.indexOf(current);
}

export function timelineEventTypeForStatus(status: string | null | undefined): ApplicationTimelineEventType {
  const normalized = normalizeApplicationStatus(status);
  if (normalized === "preparing") return "documents_prepared";
  if (normalized === "ready_to_apply") return "ready_to_apply";
  if (normalized === "applied") return "applied";
  if (normalized === "viewed") return "viewed";
  if (normalized === "screening") return "screening";
  if (normalized === "assessment") return "assessment_received";
  if (normalized === "interview_scheduled") return "interview_scheduled";
  if (normalized === "interview_completed") return "interview_completed";
  if (normalized === "offer_received" || normalized === "offer_accepted" || normalized === "offer_declined") return "offer";
  if (normalized === "rejected") return "rejection";
  if (normalized === "withdrawn") return "withdrawal";
  return "status_change";
}

export function applicationMatchesTrackerView(application: ApplicationTrackerRow, view: ApplicationTrackerView, today = new Date()) {
  const status = normalizeApplicationStatus(application.status);
  if (view === "all") return true;
  if (view === "preparing") return status === "planning" || status === "preparing";
  if (view === "ready_to_apply") return status === "ready_to_apply";
  if (view === "applied") return ["applied", "viewed", "screening", "assessment"].includes(status);
  if (view === "interviews") return status === "interview_scheduled" || status === "interview_completed";
  if (view === "offers") return status === "offer_received" || status === "offer_accepted" || status === "offer_declined";
  if (view === "closed") return ["offer_accepted", "offer_declined", "rejected", "withdrawn", "closed", "archived"].includes(status);
  if (view === "follow_up_needed") {
    if (!application.follow_up_date && !application.next_action_date) return false;
    const date = new Date(application.follow_up_date ?? application.next_action_date ?? "");
    return Number.isFinite(date.getTime()) && date <= today && isApplicationActive(status);
  }
  return true;
}

export function getApplicationNextAction(application: ApplicationTrackerRow, today = new Date()) {
  if (application.next_action?.trim()) return application.next_action.trim();
  const status = normalizeApplicationStatus(application.status);
  if (status === "planning") return "Prepare your documents";
  if (status === "preparing") return "Review documents and missing details";
  if (status === "ready_to_apply") return "Apply when you are ready";
  if (status === "applied") return application.follow_up_date ? "Follow up if needed" : "Set a follow-up date";
  if (status === "viewed" || status === "screening") return "Monitor response and prepare examples";
  if (status === "assessment") return "Complete the assessment before the deadline";
  if (status === "interview_scheduled") return "Prepare for interview";
  if (status === "interview_completed") return "Send or log follow-up";
  if (status === "offer_received") return "Review the offer";
  return "Keep your record up to date";
}

export function countApplicationDocuments(application: ApplicationTrackerRow) {
  const optionalMessages = Array.isArray(application.optional_message_ids_json) ? application.optional_message_ids_json.length : 0;
  const supporting = Array.isArray(application.supporting_document_ids_json) ? application.supporting_document_ids_json.length : 0;
  return Number(Boolean(application.targeted_cv_document_id)) + Number(Boolean(application.cover_letter_document_id)) + optionalMessages + supporting;
}

export function summarizeApplicationTracker(applications: ApplicationTrackerRow[], today = new Date()): ApplicationTrackerSummary {
  const active = applications.filter((application) => isApplicationActive(application.status));
  const followUpsDue = applications.filter((application) => applicationMatchesTrackerView(application, "follow_up_needed", today)).length;
  const interviews = applications.filter((application) => ["interview_scheduled", "interview_completed"].includes(normalizeApplicationStatus(application.status))).length;
  const latestApplication = [...applications].sort((a, b) => String(b.updated_at ?? b.created_at ?? "").localeCompare(String(a.updated_at ?? a.created_at ?? "")))[0] ?? null;
  const nextApplication =
    active.find((application) => application.follow_up_date || application.next_action_date) ??
    active.find((application) => normalizeApplicationStatus(application.status) === "ready_to_apply") ??
    active[0] ??
    null;

  return {
    activeApplications: active.length,
    followUpsDue,
    interviews,
    latestApplication,
    nextAction: nextApplication
      ? {
          label: getApplicationNextAction(nextApplication, today),
          applicationId: nextApplication.id,
          dueDate: nextApplication.next_action_date ?? nextApplication.follow_up_date ?? null
        }
      : {
          label: "Save or start an application"
        }
  };
}

export function applicationEventsForPathzyTimeline(applications: ApplicationTrackerRow[]) {
  return applications
    .filter((application) => application.status)
    .map((application) => ({
      key: `application-${application.id}`,
      label: `${application.role ?? "Application"} at ${application.company_name ?? "organization"}`,
      status: normalizeApplicationStatus(application.status),
      nextAction: getApplicationNextAction(application)
    }));
}
