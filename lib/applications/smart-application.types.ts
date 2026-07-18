export type SmartApplicationStatus =
  | "saved"
  | "planning"
  | "preparing"
  | "preparing_documents"
  | "review_required"
  | "ready_to_apply"
  | "applied"
  | "viewed"
  | "screening"
  | "assessment"
  | "interview"
  | "interview_scheduled"
  | "interview_completed"
  | "offer"
  | "offer_received"
  | "accepted"
  | "offer_accepted"
  | "offer_declined"
  | "rejected"
  | "withdrawn"
  | "closed"
  | "archived";

export type SmartApplicationReadiness = "blocked" | "review_required" | "ready_to_apply";
export type SmartChecklistState = "complete" | "incomplete" | "blocked";
export type ApplicationTrackerView = "all" | "preparing" | "ready_to_apply" | "applied" | "interviews" | "offers" | "follow_up_needed" | "closed";

export type ApplicationTimelineEventType =
  | "application_created"
  | "documents_prepared"
  | "ready_to_apply"
  | "applied"
  | "viewed"
  | "screening"
  | "assessment_received"
  | "interview_invited"
  | "interview_scheduled"
  | "interview_completed"
  | "follow_up"
  | "offer"
  | "rejection"
  | "withdrawal"
  | "note"
  | "document_update"
  | "status_change";

export type ApplicationContactType = "recruiter" | "hiring_manager" | "referral_contact" | "interviewer";

export type ApplicationContact = {
  id: string;
  type: ApplicationContactType;
  name: string;
  organization?: string;
  email?: string;
  phone?: string;
  notes?: string;
};

export type ApplicationTimelineEvent = {
  id?: string;
  applicationId?: string;
  eventType: ApplicationTimelineEventType;
  fromStatus?: string | null;
  toStatus?: string | null;
  note: string;
  eventAt: string;
};

export type SmartApplicationChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  state: SmartChecklistState;
  reason: string;
};

export type SmartApplicationApprovals = {
  cv: boolean;
  coverLetter: boolean;
  applicationMessage: boolean;
  supportingDocuments: boolean;
  packageApproved: boolean;
};

export type SmartApplicationRecord = {
  id: string;
  userId: string;
  companyName: string;
  role: string;
  opportunityType: string;
  status: SmartApplicationStatus | string;
  readiness: SmartApplicationReadiness;
  canonicalProfileId?: string;
  canonicalProfileVersion?: number;
  jobUnderstandingId?: string;
  jobUnderstandingVersion?: number;
  jobMatchAnalysisId?: string;
  targetedCvDocumentId?: string;
  coverLetterDocumentId?: string;
  optionalMessageIds: string[];
  supportingDocumentIds: string[];
  checklist: SmartApplicationChecklistItem[];
  warnings: string[];
  approvals: SmartApplicationApprovals;
  history: Array<{ at: string; event: string; note: string }>;
  timelineEvents?: ApplicationTimelineEvent[];
  contacts?: ApplicationContact[];
  closingDate?: string | null;
  plannedApplicationDate?: string | null;
  appliedDate?: string | null;
  followUpDate?: string | null;
  assessmentDeadline?: string | null;
  interviewDate?: string | null;
  expectedResponseDate?: string | null;
  nextActionDate?: string | null;
  nextAction?: string | null;
  staleState: "current" | "stale";
  createdAt: string;
  updatedAt: string;
};
