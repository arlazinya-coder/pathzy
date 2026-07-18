import type { SupabaseClient } from "@supabase/supabase-js";
import { getOrCreateCanonicalProfile } from "@/lib/canonical-profile";
import { analyzeConfirmedJobAgainstProfile, freshnessForProfileJobMatch } from "./profile-job-match-engine";
import type { ProfileJobMatchAnalysis, SemanticJobUnderstanding } from "./job-intelligence.types";

type Supabase = SupabaseClient;

export class ProfileJobMatchError extends Error {
  userMessage: string;
  status: number;

  constructor(message: string, userMessage = message, status = 400) {
    super(message);
    this.name = "ProfileJobMatchError";
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

async function getConfirmedJobUnderstanding(supabase: Supabase, userId: string, jobUnderstandingId: string) {
  const { data, error } = await supabase
    .from("job_understandings")
    .select("*")
    .eq("id", jobUnderstandingId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new ProfileJobMatchError("Job analysis not found.", "We could not find this job analysis. Please confirm the job analysis first.", 404);
  const understanding = rowToUnderstanding(data);
  if (understanding.status !== "confirmed") {
    throw new ProfileJobMatchError("Job analysis is not confirmed.", "Please confirm the job analysis before matching it to your Professional Identity.");
  }
  return understanding;
}

async function persistProfileJobMatch(supabase: Supabase, analysis: ProfileJobMatchAnalysis) {
  const { data, error } = await supabase
    .from("job_match_analyses")
    .upsert(
      {
        id: analysis.id,
        user_id: analysis.userId,
        job_understanding_id: analysis.jobUnderstandingId,
        job_understanding_version: analysis.jobUnderstandingVersion,
        canonical_profile_id: analysis.canonicalProfileId,
        canonical_profile_version: analysis.canonicalProfileVersion,
        status: analysis.status,
        requirement_matches_json: analysis.requirements,
        strengths_json: analysis.strengths,
        partial_matches_json: analysis.partialMatches,
        gaps_json: analysis.gaps,
        uncertainties_json: analysis.uncertainties,
        blockers_json: analysis.blockers,
        fit_score: analysis.fitScore ?? null,
        fit_band: analysis.fitBand,
        analysis_confidence: analysis.analysisConfidence,
        readiness: analysis.readiness,
        score_explanation_json: analysis.scoreExplanation,
        recommendations_json: analysis.recommendations,
        clarification_questions_json: analysis.clarificationQuestions,
        targeted_cv_route: analysis.targetedCvRoute,
        scoring_version: analysis.scoringVersion,
        freshness_json: analysis.freshness ?? {},
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();
  if (error) throw error;
  return rowToMatch(data);
}

export async function createProfileJobMatchAnalysis(supabase: Supabase, userId: string, jobUnderstandingId: string) {
  const [profile, understanding] = await Promise.all([
    getOrCreateCanonicalProfile(supabase, userId),
    getConfirmedJobUnderstanding(supabase, userId, jobUnderstandingId)
  ]);
  const analysis = analyzeConfirmedJobAgainstProfile({ profile, jobUnderstanding: understanding });
  return persistProfileJobMatch(supabase, analysis);
}

export async function getLatestProfileJobMatches(supabase: Supabase, userId: string) {
  const [profile, { data, error }] = await Promise.all([
    getOrCreateCanonicalProfile(supabase, userId),
    supabase
      .from("job_match_analyses")
      .select("*, job_understandings(version_number)")
      .eq("user_id", userId)
      .is("archived_at", null)
      .order("updated_at", { ascending: false })
      .limit(20)
  ]);
  if (error) throw error;
  return (data ?? []).map((row: any) => {
    const analysis = rowToMatch(row);
    const currentJobVersion = row.job_understandings?.version_number ?? analysis.jobUnderstandingVersion;
    const freshness = freshnessForProfileJobMatch({ analysis, currentProfileVersion: profile.version, currentJobUnderstandingVersion: currentJobVersion });
    return { ...analysis, status: freshness.stale ? "stale" : analysis.status, freshness };
  });
}

export async function refreshProfileJobMatchAnalysis(supabase: Supabase, userId: string, analysisId: string) {
  const { data, error } = await supabase
    .from("job_match_analyses")
    .select("job_understanding_id")
    .eq("id", analysisId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.job_understanding_id) throw new ProfileJobMatchError("Match analysis not found.", "We could not find this match analysis.", 404);
  return createProfileJobMatchAnalysis(supabase, userId, data.job_understanding_id);
}
