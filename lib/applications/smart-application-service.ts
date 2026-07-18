import type { SupabaseClient } from "@supabase/supabase-js";
import { getOrCreateCanonicalProfile } from "@/lib/canonical-profile";
import { createTargetedProfessionalDocumentPackage } from "@/lib/job-intelligence";
import type { SmartApplicationApprovals, SmartApplicationChecklistItem, SmartApplicationReadiness, SmartApplicationRecord, SmartApplicationStatus } from "./smart-application.types";

type Supabase = SupabaseClient;

export class SmartApplicationError extends Error {
  userMessage: string;
  status: number;

  constructor(message: string, userMessage = message, status = 400) {
    super(message);
    this.name = "SmartApplicationError";
    this.userMessage = userMessage;
    this.status = status;
  }
}

type JobMatchRow = {
  id: string;
  user_id: string;
  job_understanding_id: string;
  job_understanding_version: number;
  canonical_profile_id: string;
  canonical_profile_version: number;
  status: string;
  readiness: string;
  blockers_json?: unknown[];
  warnings_json?: unknown[];
  updated_at: string;
};

type JobUnderstandingRow = {
  id: string;
  job_title: string;
  organization?: string | null;
  employment_type?: string | null;
  application_details_json?: { applicationMethod?: string; requiredDocuments?: string[] } | null;
  version_number?: number | null;
};

function jsonArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function approvalsFromDocuments(input: { cvId?: string; coverLetterId?: string; optionalMessageIds: string[]; supportingDocumentIds: string[] }): SmartApplicationApprovals {
  return {
    cv: false,
    coverLetter: false,
    applicationMessage: input.optionalMessageIds.length === 0,
    supportingDocuments: input.supportingDocumentIds.length === 0,
    packageApproved: false
  };
}

function checklistFor(input: {
  job: JobUnderstandingRow;
  match: JobMatchRow;
  cvId?: string;
  coverLetterId?: string;
  optionalMessageIds: string[];
  supportingDocumentIds: string[];
  approvals: SmartApplicationApprovals;
}) {
  const requiredDocuments = input.job.application_details_json?.requiredDocuments ?? [];
  const blockers = Array.isArray(input.match.blockers_json) ? input.match.blockers_json.length : 0;
  const items: SmartApplicationChecklistItem[] = [
    {
      id: "job-details-reviewed",
      label: "Job details reviewed",
      required: true,
      state: input.job.job_title ? "complete" : "blocked",
      reason: input.job.job_title ? "The confirmed job analysis is linked." : "Confirm the job analysis first."
    },
    {
      id: "eligibility-reviewed",
      label: "Eligibility reviewed",
      required: true,
      state: blockers ? "blocked" : "complete",
      reason: blockers ? "Potential blockers must be reviewed before applying." : "No potential blocker is currently linked."
    },
    {
      id: "profile-current",
      label: "Professional Identity current",
      required: true,
      state: input.match.status === "stale" ? "incomplete" : "complete",
      reason: input.match.status === "stale" ? "Refresh the job match before applying." : "Profile and match versions are recorded."
    },
    {
      id: "targeted-cv-ready",
      label: "Targeted CV ready",
      required: true,
      state: input.cvId && input.approvals.cv ? "complete" : input.cvId ? "incomplete" : "blocked",
      reason: input.cvId ? "Review and approve the targeted CV." : "Create the targeted CV."
    },
    {
      id: "cover-letter-ready",
      label: "Cover letter ready",
      required: true,
      state: input.coverLetterId && input.approvals.coverLetter ? "complete" : input.coverLetterId ? "incomplete" : "blocked",
      reason: input.coverLetterId ? "Review and approve the cover letter." : "Create the cover letter."
    },
    {
      id: "application-message-ready",
      label: "Application message ready",
      required: false,
      state: input.optionalMessageIds.length ? (input.approvals.applicationMessage ? "complete" : "incomplete") : "complete",
      reason: input.optionalMessageIds.length ? "Review optional message drafts if you plan to use them." : "No optional message is required."
    },
    {
      id: "required-documents-attached",
      label: "Required documents attached",
      required: requiredDocuments.length > 0,
      state: requiredDocuments.length === 0 || input.supportingDocumentIds.length > 0 ? "complete" : "incomplete",
      reason: requiredDocuments.length ? "Select supporting documents before applying." : "No required supporting document was detected."
    },
    {
      id: "application-method-confirmed",
      label: "Application method confirmed",
      required: true,
      state: input.job.application_details_json?.applicationMethod ? "complete" : "incomplete",
      reason: input.job.application_details_json?.applicationMethod ? "Application instructions are linked." : "Confirm how this application should be sent."
    },
    {
      id: "user-approval-completed",
      label: "User approval completed",
      required: true,
      state: input.approvals.packageApproved ? "complete" : "incomplete",
      reason: "Approve the package only after reviewing every document."
    }
  ];
  return items;
}

function readinessFromChecklist(checklist: SmartApplicationChecklistItem[]): SmartApplicationReadiness {
  if (checklist.some((item) => item.required && item.state === "blocked")) return "blocked";
  if (checklist.some((item) => item.required && item.state !== "complete")) return "review_required";
  return "ready_to_apply";
}

function statusFromReadiness(readiness: SmartApplicationReadiness, approved: boolean): SmartApplicationStatus {
  if (approved && readiness === "ready_to_apply") return "ready_to_apply";
  if (readiness === "blocked") return "review_required";
  return "review_required";
}

function recordFromRow(row: any): SmartApplicationRecord {
  return {
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    role: row.role,
    opportunityType: row.opportunity_type,
    status: row.status,
    readiness: row.application_readiness ?? "review_required",
    canonicalProfileId: row.canonical_profile_id ?? undefined,
    canonicalProfileVersion: row.canonical_profile_version ?? undefined,
    jobUnderstandingId: row.job_understanding_id ?? undefined,
    jobUnderstandingVersion: row.job_understanding_version ?? undefined,
    jobMatchAnalysisId: row.job_match_analysis_id ?? undefined,
    targetedCvDocumentId: row.targeted_cv_document_id ?? undefined,
    coverLetterDocumentId: row.cover_letter_document_id ?? undefined,
    optionalMessageIds: jsonArray(row.optional_message_ids_json),
    supportingDocumentIds: jsonArray(row.supporting_document_ids_json),
    checklist: Array.isArray(row.checklist_json) ? row.checklist_json : [],
    warnings: jsonArray(row.warnings_json),
    approvals: row.approvals_json ?? { cv: false, coverLetter: false, applicationMessage: false, supportingDocuments: false, packageApproved: false },
    history: Array.isArray(row.status_history_json) ? row.status_history_json : [],
    staleState: row.stale_state ?? "current",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function loadOwnedMatch(supabase: Supabase, userId: string, analysisId: string) {
  const { data, error } = await supabase
    .from("job_match_analyses")
    .select("*")
    .eq("id", analysisId)
    .eq("user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new SmartApplicationError("Job match not found.", "We could not find this job match. Please create it again.", 404);
  return data as JobMatchRow;
}

async function loadOwnedJob(supabase: Supabase, userId: string, jobUnderstandingId: string) {
  const { data, error } = await supabase
    .from("job_understandings")
    .select("id, job_title, organization, employment_type, application_details_json, version_number")
    .eq("id", jobUnderstandingId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new SmartApplicationError("Job analysis not found.", "We could not find the confirmed job analysis.", 404);
  return data as JobUnderstandingRow;
}

async function findExistingApplication(supabase: Supabase, userId: string, analysisId: string) {
  const { data, error } = await supabase
    .from("employment_applications")
    .select("*")
    .eq("user_id", userId)
    .eq("job_match_analysis_id", analysisId)
    .neq("status", "archived")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? recordFromRow(data) : null;
}

async function findTargetedDocuments(supabase: Supabase, userId: string, analysisId: string) {
  const { data, error } = await supabase
    .from("professional_documents")
    .select("id, document_type, approval_state")
    .eq("user_id", userId)
    .eq("job_match_analysis_id", analysisId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  return {
    cvId: rows.find((row) => row.document_type === "cv")?.id as string | undefined,
    coverLetterId: rows.find((row) => row.document_type === "cover_letter")?.id as string | undefined,
    optionalMessageIds: rows.filter((row) => ["application_email", "linkedin_message", "recruiter_message"].includes(row.document_type)).map((row) => row.id as string),
    approvals: {
      cv: rows.find((row) => row.document_type === "cv")?.approval_state === "approved",
      coverLetter: rows.find((row) => row.document_type === "cover_letter")?.approval_state === "approved",
      applicationMessage: rows.filter((row) => ["application_email", "linkedin_message", "recruiter_message"].includes(row.document_type)).every((row) => row.approval_state === "approved"),
      supportingDocuments: false,
      packageApproved: false
    }
  };
}

async function ensureTargetedDocuments(supabase: Supabase, userId: string, analysisId: string) {
  let documents = await findTargetedDocuments(supabase, userId, analysisId);
  if (!documents.cvId || !documents.coverLetterId) {
    await createTargetedProfessionalDocumentPackage(supabase, userId, {
      analysisId,
      includeApplicationEmail: true,
      includeLinkedInMessage: true,
      includeRecruiterMessage: true
    });
    documents = await findTargetedDocuments(supabase, userId, analysisId);
  }
  return documents;
}

export async function prepareSmartApplicationWorkspace(supabase: Supabase, userId: string, input: { analysisId: string; createAnotherVersion?: boolean }) {
  if (!input.createAnotherVersion) {
    const existing = await findExistingApplication(supabase, userId, input.analysisId);
    if (existing) return { application: existing, reused: true };
  }

  const [profile, match] = await Promise.all([
    getOrCreateCanonicalProfile(supabase, userId),
    loadOwnedMatch(supabase, userId, input.analysisId)
  ]);
  const job = await loadOwnedJob(supabase, userId, match.job_understanding_id);
  if (match.canonical_profile_id !== profile.id) {
    throw new SmartApplicationError("Profile mismatch.", "Refresh the job match before preparing the application workspace.");
  }
  const targeted = await ensureTargetedDocuments(supabase, userId, input.analysisId);
  const approvals = approvalsFromDocuments({
    cvId: targeted.cvId,
    coverLetterId: targeted.coverLetterId,
    optionalMessageIds: targeted.optionalMessageIds,
    supportingDocumentIds: []
  });
  approvals.cv = targeted.approvals.cv;
  approvals.coverLetter = targeted.approvals.coverLetter;
  approvals.applicationMessage = targeted.optionalMessageIds.length ? targeted.approvals.applicationMessage : true;
  const checklist = checklistFor({ job, match, cvId: targeted.cvId, coverLetterId: targeted.coverLetterId, optionalMessageIds: targeted.optionalMessageIds, supportingDocumentIds: [], approvals });
  const readiness = readinessFromChecklist(checklist);
  const now = new Date().toISOString();
  const row = {
    user_id: userId,
    company_name: job.organization || "Organisation to confirm",
    role: job.job_title,
    opportunity_type: job.employment_type || "job",
    status: statusFromReadiness(readiness, approvals.packageApproved),
    application_readiness: readiness,
    canonical_profile_id: profile.id,
    canonical_profile_version: profile.version,
    job_understanding_id: job.id,
    job_understanding_version: job.version_number ?? match.job_understanding_version,
    job_match_analysis_id: match.id,
    targeted_cv_document_id: targeted.cvId ?? null,
    cover_letter_document_id: targeted.coverLetterId ?? null,
    optional_message_ids_json: targeted.optionalMessageIds,
    supporting_document_ids_json: [],
    checklist_json: checklist,
    warnings_json: [
      ...(Array.isArray(match.blockers_json) && match.blockers_json.length ? ["Review potential eligibility blockers before applying."] : []),
      ...checklist.filter((item) => item.required && item.state !== "complete").map((item) => item.reason)
    ],
    approvals_json: approvals,
    status_history_json: [{ at: now, event: "workspace_created", note: input.createAnotherVersion ? "Created another application package version." : "Prepared application package for user review." }],
    stale_state: match.status === "stale" ? "stale" : "current",
    notes: "Smart Application Workspace. Nothing has been submitted automatically.",
    updated_at: now
  };
  const { data, error } = await supabase.from("employment_applications").insert(row).select("*").single();
  if (error) throw error;
  return { application: recordFromRow(data), reused: false };
}

export async function updateSmartApplicationApproval(supabase: Supabase, userId: string, input: { applicationId: string; approval: keyof SmartApplicationApprovals; value: boolean }) {
  const { data: existing, error } = await supabase
    .from("employment_applications")
    .select("*")
    .eq("id", input.applicationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!existing) throw new SmartApplicationError("Application not found.", "We could not find this application workspace.", 404);
  const approvals: SmartApplicationApprovals = {
    cv: false,
    coverLetter: false,
    applicationMessage: false,
    supportingDocuments: false,
    packageApproved: false,
    ...(existing.approvals_json ?? {})
  };
  approvals[input.approval] = input.value;
  const job: JobUnderstandingRow = {
    id: existing.job_understanding_id,
    job_title: existing.role,
    organization: existing.company_name,
    employment_type: existing.opportunity_type,
    application_details_json: {},
    version_number: existing.job_understanding_version
  };
  const match: JobMatchRow = {
    id: existing.job_match_analysis_id,
    user_id: userId,
    job_understanding_id: existing.job_understanding_id,
    job_understanding_version: existing.job_understanding_version,
    canonical_profile_id: existing.canonical_profile_id,
    canonical_profile_version: existing.canonical_profile_version,
    status: existing.stale_state === "stale" ? "stale" : "current",
    readiness: existing.application_readiness,
    blockers_json: [],
    updated_at: existing.updated_at
  };
  const checklist = checklistFor({
    job,
    match,
    cvId: existing.targeted_cv_document_id,
    coverLetterId: existing.cover_letter_document_id,
    optionalMessageIds: jsonArray(existing.optional_message_ids_json),
    supportingDocumentIds: jsonArray(existing.supporting_document_ids_json),
    approvals
  });
  const readiness = readinessFromChecklist(checklist);
  const now = new Date().toISOString();
  const history = Array.isArray(existing.status_history_json) ? existing.status_history_json : [];
  const { data, error: updateError } = await supabase
    .from("employment_applications")
    .update({
      approvals_json: approvals,
      checklist_json: checklist,
      application_readiness: readiness,
      status: statusFromReadiness(readiness, approvals.packageApproved),
      status_history_json: [...history, { at: now, event: "approval_updated", note: `${input.approval} set to ${input.value ? "approved" : "not approved"}.` }],
      updated_at: now
    })
    .eq("id", input.applicationId)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (updateError) throw updateError;
  return recordFromRow(data);
}

export async function updateSmartApplicationSupportingDocuments(supabase: Supabase, userId: string, input: { applicationId: string; supportingDocumentIds: string[] }) {
  const safeIds = Array.from(new Set(input.supportingDocumentIds.filter((id) => /^[0-9a-f-]{32,36}$/i.test(id))));
  if (safeIds.length) {
    const { data: ownedDocuments, error: documentError } = await supabase
      .from("user_documents")
      .select("id")
      .eq("user_id", userId)
      .in("id", safeIds);
    if (documentError) throw documentError;
    if ((ownedDocuments ?? []).length !== safeIds.length) {
      throw new SmartApplicationError("Supporting document access denied.", "One selected supporting document could not be verified for your account.", 403);
    }
  }
  const { data: existing, error } = await supabase
    .from("employment_applications")
    .select("*")
    .eq("id", input.applicationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!existing) throw new SmartApplicationError("Application not found.", "We could not find this application workspace.", 404);
  const approvals: SmartApplicationApprovals = {
    cv: false,
    coverLetter: false,
    applicationMessage: false,
    supportingDocuments: false,
    packageApproved: false,
    ...(existing.approvals_json ?? {})
  };
  approvals.supportingDocuments = safeIds.length > 0;
  const job: JobUnderstandingRow = {
    id: existing.job_understanding_id,
    job_title: existing.role,
    organization: existing.company_name,
    employment_type: existing.opportunity_type,
    application_details_json: {},
    version_number: existing.job_understanding_version
  };
  const match: JobMatchRow = {
    id: existing.job_match_analysis_id,
    user_id: userId,
    job_understanding_id: existing.job_understanding_id,
    job_understanding_version: existing.job_understanding_version,
    canonical_profile_id: existing.canonical_profile_id,
    canonical_profile_version: existing.canonical_profile_version,
    status: existing.stale_state === "stale" ? "stale" : "current",
    readiness: existing.application_readiness,
    blockers_json: [],
    updated_at: existing.updated_at
  };
  const checklist = checklistFor({
    job,
    match,
    cvId: existing.targeted_cv_document_id,
    coverLetterId: existing.cover_letter_document_id,
    optionalMessageIds: jsonArray(existing.optional_message_ids_json),
    supportingDocumentIds: safeIds,
    approvals
  });
  const readiness = readinessFromChecklist(checklist);
  const now = new Date().toISOString();
  const history = Array.isArray(existing.status_history_json) ? existing.status_history_json : [];
  const { data, error: updateError } = await supabase
    .from("employment_applications")
    .update({
      supporting_document_ids_json: safeIds,
      approvals_json: approvals,
      checklist_json: checklist,
      application_readiness: readiness,
      status: statusFromReadiness(readiness, approvals.packageApproved),
      status_history_json: [...history, { at: now, event: "supporting_documents_updated", note: `${safeIds.length} supporting document${safeIds.length === 1 ? "" : "s"} selected.` }],
      updated_at: now
    })
    .eq("id", input.applicationId)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (updateError) throw updateError;
  return recordFromRow(data);
}
