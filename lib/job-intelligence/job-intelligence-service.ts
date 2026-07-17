import type { SupabaseClient } from "@supabase/supabase-js";
import { getOrCreateCanonicalProfile } from "@/lib/canonical-profile";
import { analyzeJobAgainstCanonicalProfile } from "./job-match-engine";
import { inspectJobAdvertisement } from "./job-requirement-parser";
import type { InspectJobAdvertisementInput, JobMatchAnalysis } from "./job-intelligence.types";

type Supabase = SupabaseClient;

export async function runJobIntelligenceAnalysis(
  supabase: Supabase,
  input: InspectJobAdvertisementInput & { userId: string; persist?: boolean }
): Promise<JobMatchAnalysis> {
  const profile = await getOrCreateCanonicalProfile(supabase, input.userId);
  const job = inspectJobAdvertisement(input);
  const analysis = analyzeJobAgainstCanonicalProfile({ profile, job, userId: input.userId });

  if (input.persist) {
    await persistJobIntelligenceAnalysis(supabase, analysis);
  }

  return analysis;
}

export async function persistJobIntelligenceAnalysis(supabase: Supabase, analysis: JobMatchAnalysis) {
  if (!analysis.userId) throw new Error("User id is required to save job intelligence.");
  const { data, error } = await supabase
    .from("job_intelligence_analyses")
    .upsert(
      {
        id: analysis.id,
        user_id: analysis.userId,
        canonical_profile_id: analysis.canonicalProfileId,
        profile_version: analysis.profileVersion,
        source_type: analysis.job.sourceType,
        source_opportunity_id: analysis.job.sourceOpportunityId ?? null,
        job_title: analysis.job.title ?? null,
        company_name: analysis.job.company ?? null,
        location: analysis.job.location ?? null,
        language: analysis.job.language,
        job_text_hash: analysis.job.rawTextHash,
        structured_job_json: analysis.job,
        match_json: analysis,
        suitability_status: analysis.suitability,
        readiness_score: analysis.readinessScore,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    )
    .select("*")
    .maybeSingle();
  if (error) throw error;
  const requirements = analysis.job.requirements.map((requirement) => ({
    analysis_id: analysis.id,
    user_id: analysis.userId,
    requirement_key: requirement.id,
    requirement_text: requirement.text,
    normalized_text: requirement.normalizedText,
    category: requirement.category,
    importance: requirement.importance,
    confidence: requirement.confidence,
    source_line: requirement.sourceLine ?? null
  }));

  if (requirements.length) {
    const { data: savedRequirements, error: requirementError } = await supabase
      .from("job_intelligence_requirements")
      .upsert(requirements, { onConflict: "analysis_id,requirement_key" })
      .select("id,requirement_key");
    if (requirementError) throw requirementError;

    const requirementIdByKey = new Map((savedRequirements ?? []).map((item: any) => [item.requirement_key, item.id]));
    const evidenceRows = [...analysis.strengths, ...analysis.partialMatches, ...analysis.uncertainties]
      .flatMap((match) =>
        match.evidence.map((evidence) => ({
          analysis_id: analysis.id,
          requirement_id: requirementIdByKey.get(match.requirement.id) ?? null,
          user_id: analysis.userId,
          canonical_entity_type: evidence.entityType,
          canonical_entity_id: evidence.entityId,
          evidence_status: match.status,
          evidence_strength: match.score,
          explanation: match.explanation,
          source_json: evidence
        }))
      );

    if (evidenceRows.length) {
      const { error: deleteEvidenceError } = await supabase.from("job_intelligence_evidence").delete().eq("analysis_id", analysis.id).eq("user_id", analysis.userId);
      if (deleteEvidenceError) throw deleteEvidenceError;
      const { error: evidenceError } = await supabase.from("job_intelligence_evidence").insert(evidenceRows);
      if (evidenceError) throw evidenceError;
    }
  }
  return data;
}

export async function getLatestJobIntelligenceAnalyses(supabase: Supabase, userId: string) {
  const { data, error } = await supabase
    .from("job_intelligence_analyses")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}
