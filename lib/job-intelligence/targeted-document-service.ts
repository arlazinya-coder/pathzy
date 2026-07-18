import type { SupabaseClient } from "@supabase/supabase-js";
import { getOrCreateCanonicalProfile } from "@/lib/canonical-profile";
import { persistProfessionalDocument } from "@/lib/professional-documents";
import type { TargetedDocumentApprovalState, CreateTargetedDocumentsInput, ProfileJobMatchAnalysis, SemanticJobUnderstanding } from "./job-intelligence.types";
import { buildTargetedProfessionalDocuments } from "./targeted-document-strategy";

type Supabase = SupabaseClient;

export class TargetedDocumentError extends Error {
  userMessage: string;
  status: number;

  constructor(message: string, userMessage = message, status = 400) {
    super(message);
    this.name = "TargetedDocumentError";
    this.userMessage = userMessage;
    this.status = status;
  }
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

function rowToMatch(row: any): ProfileJobMatchAnalysis {
  return {
    id: row.id,
    userId: row.user_id,
    jobUnderstandingId: row.job_understanding_id,
    jobUnderstandingVersion: row.job_understanding_version,
    canonicalProfileId: row.canonical_profile_id,
    canonicalProfileVersion: row.canonical_profile_version,
    status: row.status,
    requirements: row.requirement_matches_json ?? [],
    strengths: row.strengths_json ?? [],
    partialMatches: row.partial_matches_json ?? [],
    gaps: row.gaps_json ?? [],
    uncertainties: row.uncertainties_json ?? [],
    blockers: row.blockers_json ?? [],
    fitScore: row.fit_score ?? undefined,
    fitBand: row.fit_band,
    analysisConfidence: Number(row.analysis_confidence ?? 0),
    readiness: row.readiness,
    scoreExplanation: row.score_explanation_json ?? { strongEvidence: [], concerns: [], methodology: "" },
    recommendations: row.recommendations_json ?? [],
    clarificationQuestions: row.clarification_questions_json ?? [],
    targetedCvRoute: row.targeted_cv_route,
    scoringVersion: row.scoring_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    freshness: row.freshness_json ?? undefined
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
  if (!data) throw new TargetedDocumentError("Match analysis not found.", "We could not find this job match. Please create the match again.", 404);
  return rowToMatch(data);
}

async function loadOwnedUnderstanding(supabase: Supabase, userId: string, jobUnderstandingId: string) {
  const { data, error } = await supabase
    .from("job_understandings")
    .select("*")
    .eq("id", jobUnderstandingId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new TargetedDocumentError("Job analysis not found.", "We could not find this confirmed job analysis.", 404);
  const understanding = rowToUnderstanding(data);
  if (understanding.status !== "confirmed") {
    throw new TargetedDocumentError("Job analysis is not confirmed.", "Please confirm the job analysis before preparing targeted documents.");
  }
  return understanding;
}

export async function createTargetedProfessionalDocumentPackage(supabase: Supabase, userId: string, input: CreateTargetedDocumentsInput) {
  const matchAnalysis = await loadOwnedMatch(supabase, userId, input.analysisId);
  const [profile, jobUnderstanding] = await Promise.all([
    getOrCreateCanonicalProfile(supabase, userId),
    loadOwnedUnderstanding(supabase, userId, matchAnalysis.jobUnderstandingId)
  ]);
  if (matchAnalysis.canonicalProfileId !== profile.id) {
    throw new TargetedDocumentError("Profile mismatch.", "This match belongs to a different Professional Identity version. Refresh the match before creating documents.");
  }
  const result = buildTargetedProfessionalDocuments({
    userId,
    profile,
    jobUnderstanding,
    matchAnalysis,
    includeApplicationEmail: input.includeApplicationEmail,
    includeLinkedInMessage: input.includeLinkedInMessage,
    includeRecruiterMessage: input.includeRecruiterMessage
  });
  const persisted = await Promise.all(result.documents.map((document) => persistProfessionalDocument(supabase, document)));
  return {
    ...result.package,
    documents: result.package.documents.map((document, index) => ({
      ...document,
      professionalDocumentId: persisted[index]?.id ?? document.professionalDocumentId
    }))
  };
}

export async function updateTargetedDocumentApproval(supabase: Supabase, userId: string, input: { documentId: string; approvalState: TargetedDocumentApprovalState }) {
  const approvedAt = input.approvalState === "approved" ? new Date().toISOString() : null;
  const status = input.approvalState === "archived" ? "archived" : "ready";
  const { data, error } = await supabase
    .from("professional_documents")
    .update({
      approval_state: input.approvalState,
      approved_at: approvedAt,
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", input.documentId)
    .eq("user_id", userId)
    .not("job_match_analysis_id", "is", null)
    .select("id, name, approval_state, stale_state")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new TargetedDocumentError("Document not found.", "We could not find this targeted document.", 404);
  return data;
}
