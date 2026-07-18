import type { SupabaseClient } from "@supabase/supabase-js";
import { DeterministicJobUnderstandingProvider } from "./job-understanding-provider";
import type {
  JobImportRecord,
  JobUnderstandingProvider,
  JobUnderstandingReviewPatch,
  SemanticJobUnderstanding,
  StructuredJobRequirement,
  StructuredJobResponsibility
} from "./job-intelligence.types";

type Supabase = SupabaseClient;

export class JobUnderstandingError extends Error {
  userMessage: string;
  status: number;

  constructor(message: string, userMessage = message, status = 400) {
    super(message);
    this.name = "JobUnderstandingError";
    this.userMessage = userMessage;
    this.status = status;
  }
}

function rowToImport(row: any): JobImportRecord {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    sourceType: row.source_type,
    sourceLabel: row.source_label ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    sourceDocumentId: row.source_document_id ?? undefined,
    opportunityId: row.opportunity_id ?? undefined,
    rawText: row.raw_text ?? undefined,
    normalizedText: row.normalized_text ?? undefined,
    language: row.language ?? "unknown",
    inspection: row.inspection_json,
    userCorrections: row.user_corrections_json ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function rowToUnderstanding(row: any): SemanticJobUnderstanding {
  return {
    id: row.id,
    userId: row.user_id,
    jobImportId: row.job_import_id,
    versionNumber: row.version_number ?? 1,
    status: row.status,
    language: row.language,
    title: row.job_title,
    organization: row.organization ?? undefined,
    location: row.location ?? undefined,
    employmentType: row.employment_type ?? undefined,
    workArrangement: row.work_arrangement ?? undefined,
    seniority: row.seniority ?? undefined,
    industry: row.industry ?? undefined,
    department: row.department ?? undefined,
    summary: row.summary,
    responsibilities: row.responsibilities_json ?? [],
    requirements: row.requirements_json ?? [],
    benefits: row.benefits_json ?? [],
    salary: row.salary_json ?? undefined,
    applicationDetails: row.application_details_json ?? {},
    warnings: row.warnings_json ?? [],
    overallConfidence: Number(row.overall_confidence ?? 0),
    modelVersion: row.model_version ?? undefined,
    promptVersion: row.prompt_version ?? undefined,
    sourceEvidence: row.source_evidence_json ?? [],
    systemExtraction: row.system_extraction_json ?? {},
    userApprovedVersion: row.user_approved_json ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getReviewedJobImport(supabase: Supabase, userId: string, jobImportId: string) {
  const { data, error } = await supabase
    .from("job_imports")
    .select("*")
    .eq("id", jobImportId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new JobUnderstandingError("Job import not found.", "We could not find this job import. Please import the job advert again.", 404);
  const jobImport = rowToImport(data);
  if (jobImport.status !== "ready") {
    throw new JobUnderstandingError("Job import is not reviewed.", "Please review and save the imported job details before creating the job analysis.");
  }
  return jobImport;
}

async function persistJobUnderstanding(supabase: Supabase, understanding: SemanticJobUnderstanding) {
  const { data, error } = await supabase
    .from("job_understandings")
    .upsert(
      {
        id: understanding.id,
        user_id: understanding.userId,
        job_import_id: understanding.jobImportId,
        status: understanding.status,
        language: understanding.language,
        job_title: understanding.title,
        organization: understanding.organization ?? null,
        location: understanding.location ?? null,
        employment_type: understanding.employmentType ?? null,
        work_arrangement: understanding.workArrangement ?? null,
        seniority: understanding.seniority ?? null,
        industry: understanding.industry ?? null,
        department: understanding.department ?? null,
        summary: understanding.summary,
        responsibilities_json: understanding.responsibilities,
        requirements_json: understanding.requirements,
        benefits_json: understanding.benefits ?? [],
        salary_json: understanding.salary ?? {},
        application_details_json: understanding.applicationDetails,
        warnings_json: understanding.warnings,
        overall_confidence: understanding.overallConfidence,
        model_version: understanding.modelVersion ?? null,
        prompt_version: understanding.promptVersion ?? null,
        source_evidence_json: understanding.sourceEvidence,
        system_extraction_json: understanding.systemExtraction,
        user_approved_json: understanding.userApprovedVersion ?? {},
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();
  if (error) throw error;
  return rowToUnderstanding(data);
}

export async function createSemanticJobUnderstanding(
  supabase: Supabase,
  userId: string,
  jobImportId: string,
  provider: JobUnderstandingProvider = new DeterministicJobUnderstandingProvider()
) {
  const jobImport = await getReviewedJobImport(supabase, userId, jobImportId);
  const result = await provider.understandJob({ jobImport });
  return persistJobUnderstanding(supabase, result.understanding);
}

export async function getLatestJobUnderstandings(supabase: Supabase, userId: string) {
  const { data, error } = await supabase
    .from("job_understandings")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map(rowToUnderstanding);
}

function markEdited<T extends { id: string; userStatus?: string }>(items: T[] | undefined, fallback: T[]) {
  if (!items) return fallback;
  return items.map((item) => ({ ...item, userStatus: item.userStatus ?? "edited" }));
}

export async function updateSemanticJobUnderstandingReview(
  supabase: Supabase,
  userId: string,
  understandingId: string,
  patch: JobUnderstandingReviewPatch
) {
  const { data: existing, error: existingError } = await supabase
    .from("job_understandings")
    .select("*")
    .eq("id", understandingId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existingError) throw existingError;
  if (!existing) throw new JobUnderstandingError("Job analysis not found.", "We could not find this job analysis. Please try again.", 404);

  const current = rowToUnderstanding(existing);
  const next: SemanticJobUnderstanding = {
    ...current,
    status: patch.confirm ? "confirmed" : "review_required",
    title: patch.title ?? current.title,
    organization: patch.organization ?? current.organization,
    location: patch.location ?? current.location,
    employmentType: patch.employmentType ?? current.employmentType,
    workArrangement: patch.workArrangement ?? current.workArrangement,
    requirements: markEdited<StructuredJobRequirement>(patch.requirements, current.requirements),
    responsibilities: markEdited<StructuredJobResponsibility>(patch.responsibilities, current.responsibilities),
    applicationDetails: patch.applicationDetails ?? current.applicationDetails,
    userApprovedVersion: patch.confirm
      ? {
          title: patch.title ?? current.title,
          organization: patch.organization ?? current.organization,
          location: patch.location ?? current.location,
          employmentType: patch.employmentType ?? current.employmentType,
          workArrangement: patch.workArrangement ?? current.workArrangement,
          requirements: patch.requirements ?? current.requirements,
          responsibilities: patch.responsibilities ?? current.responsibilities,
          applicationDetails: patch.applicationDetails ?? current.applicationDetails,
          confirmedAt: new Date().toISOString()
        }
      : current.userApprovedVersion,
    updatedAt: new Date().toISOString()
  };
  return persistJobUnderstanding(supabase, next);
}
