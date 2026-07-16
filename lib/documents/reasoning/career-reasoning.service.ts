import type { SupabaseClient } from "@supabase/supabase-js";
import { REASONING_ENGINE_VERSION, REASONING_TAXONOMY_VERSION, REASONING_THRESHOLDS } from "./reasoning.constants";
import { DeterministicCareerReasoningProvider } from "./reasoning-provider";
import { validateReasoningCase } from "./reasoning.schema";
import { blockingKeysForRecord, clampReasoningConfidence, collectReasoningRecords, compareSemanticDateRanges, compareTitles, createReasoningFingerprint, employmentSignals, normalizeOrganisationName, priorityForCase, scoreCandidateGroup, signal, tokenSimilarity } from "./reasoning-utils";
import type { CareerEvidenceRecord, CareerReasoningInput, ReasoningCandidateGroup, ReasoningCase, ReasoningCaseType, ReasoningRunSummary } from "./reasoning.types";
import type { SemanticDocumentModel } from "@/lib/documents/semantic";

function caseTypeFor(entityType: CareerEvidenceRecord["entityType"], records: CareerEvidenceRecord[]): ReasoningCaseType {
  if (entityType === "employment") {
    const [a, b] = records;
    const dates = compareSemanticDateRanges(a?.startDate, a?.endDate, b?.startDate, b?.endDate);
    const sameEmployer = normalizeOrganisationName(a?.organisation) && normalizeOrganisationName(a?.organisation) === normalizeOrganisationName(b?.organisation);
    if (sameEmployer && dates.relation === "adjacent" && Math.abs(compareTitles(a?.title, b?.title)) >= 0.45) return "possible_promotion";
    return "possible_same_employment";
  }
  if (entityType === "education") return "possible_same_education";
  if (entityType === "certification") return "possible_same_certification";
  if (entityType === "skill") return "possible_same_skill";
  return "possible_duplicate";
}

function groupKey(record: CareerEvidenceRecord) {
  return blockingKeysForRecord(record).map((key) => `${key.type}:${key.value}`);
}

function pairRecords(records: CareerEvidenceRecord[]) {
  const buckets = new Map<string, CareerEvidenceRecord[]>();
  for (const record of records) {
    for (const key of groupKey(record)) {
      const bucket = buckets.get(key) ?? [];
      bucket.push(record);
      buckets.set(key, bucket);
    }
  }
  const pairs = new Map<string, CareerEvidenceRecord[]>();
  for (const bucket of buckets.values()) {
    for (let i = 0; i < bucket.length; i += 1) {
      for (let j = i + 1; j < bucket.length; j += 1) {
        const a = bucket[i];
        const b = bucket[j];
        if (!a || !b || a.id === b.id || a.entityType !== b.entityType) continue;
        const pairKey = [a.id, b.id].sort().join("::");
        if (!pairs.has(pairKey)) pairs.set(pairKey, [a, b]);
      }
    }
  }
  return [...pairs.values()];
}

function genericSignals(a: CareerEvidenceRecord, b: CareerEvidenceRecord) {
  const signals = [];
  const sameOrganisation = normalizeOrganisationName(a.organisation ?? a.institution ?? a.issuer) === normalizeOrganisationName(b.organisation ?? b.institution ?? b.issuer);
  if (sameOrganisation && normalizeOrganisationName(a.organisation ?? a.institution ?? a.issuer)) signals.push(signal("same_normalized_organisation", "supports", "Organisation, institution, or issuer names match after normalisation.", 0.22, [a, b]));
  if (a.credentialId && b.credentialId && a.credentialId === b.credentialId) signals.push(signal("certificate_confirmation", "supports", "Credential identifiers match.", 0.38, [a, b]));
  const titleScore = tokenSimilarity([a.title, a.qualification].filter(Boolean).join(" "), [b.title, b.qualification].filter(Boolean).join(" "));
  if (titleScore >= 0.55) signals.push(signal("normalized_text_match", "supports", "Names or qualifications are very similar after normalisation.", 0.24 * titleScore, [a, b]));
  const dates = compareSemanticDateRanges(a.startDate, a.endDate, b.startDate, b.endDate);
  if (["exact", "compatible", "overlapping"].includes(dates.relation)) signals.push(signal("overlapping_date_range", "supports", dates.explanation, 0.14 * dates.confidence, [a, b]));
  if (dates.relation === "conflicting") signals.push(signal("contradictory_dates", "contradicts", dates.explanation, -0.22, [a, b]));
  if (!signals.length) signals.push(signal("insufficient_context", "neutral", "The records share a weak blocking key but not enough evidence for a confident conclusion.", 0.05, [a, b]));
  return signals;
}

function candidateGroupFor(records: CareerEvidenceRecord[]): ReasoningCandidateGroup {
  const [a, b] = records;
  const blockingSignals = groupKey(a).filter((key) => groupKey(b).includes(key)).map((key) => signal("normalized_text_match", "supports", `Shared blocking key: ${key}.`, 0.08, records));
  const signals = a.entityType === "employment" ? employmentSignals(a, b) : genericSignals(a, b);
  const matchingSignals = signals.filter((item) => item.direction === "supports" || item.direction === "neutral");
  const conflictingSignals = signals.filter((item) => item.direction === "contradicts");
  const preliminaryScore = clampReasoningConfidence(0.22 + blockingSignals.length * 0.05);
  return {
    id: `group:${records.map((record) => record.id).sort().join(":")}`,
    entityType: a.entityType,
    candidateEntityIds: records.flatMap((record) => record.entityIds),
    blockingSignals,
    matchingSignals,
    conflictingSignals,
    preliminaryScore
  };
}

export async function generateCareerReasoningCases(input: CareerReasoningInput) {
  const provider = new DeterministicCareerReasoningProvider();
  const records = collectReasoningRecords({ semanticModels: input.semanticModels, existingProfile: input.existingProfile });
  const pairs = pairRecords(records).filter((pair) => pair.every((record) => record.entityType !== "profile_field"));
  const now = new Date().toISOString();
  const cases: ReasoningCase[] = [];
  console.info("[career-reasoning] candidate groups created", { userId: input.userId, records: records.length, pairs: pairs.length });
  for (const pair of pairs) {
    const group = candidateGroupFor(pair);
    const confidence = scoreCandidateGroup(group);
    const hasConflict = group.conflictingSignals.length > 0;
    if (confidence < REASONING_THRESHOLDS.lowConfidence && !hasConflict) continue;
    const type = caseTypeFor(group.entityType, pair);
    const fingerprint = createReasoningFingerprint(type, pair);
    const caseId = `reasoning-${fingerprint.slice(0, 20)}`;
    const caseItem: ReasoningCase = {
      id: caseId,
      userId: input.userId,
      type,
      status: confidence >= REASONING_THRESHOLDS.mediumConfidence || hasConflict ? "needs_user_input" : "pending",
      subjectEntityIds: pair.flatMap((record) => record.entityIds),
      sourceDocumentIds: [...new Set(pair.map((record) => record.documentId))],
      semanticReadingIds: [...new Set(pair.map((record) => record.semanticReadingId))],
      candidateGroups: [group],
      confidence,
      priority: priorityForCase(group.entityType, confidence, hasConflict),
      fingerprint,
      createdAt: now,
      updatedAt: now
    };
    const decision = (await provider.reason({ case: caseItem, records: pair, signals: [...group.blockingSignals, ...group.matchingSignals, ...group.conflictingSignals] })).decision;
    cases.push(validateReasoningCase({ ...caseItem, decision }));
  }
  return cases.sort((a, b) => b.priority.score - a.priority.score).slice(0, 12);
}

export function summarizeReasoningCases(cases: ReasoningCase[]): ReasoningRunSummary {
  const matches = cases.filter((item) => item.decision?.conclusion.includes("same_entity") || item.type.includes("same")).length;
  const conflicts = cases.filter((item) => item.decision?.conclusion === "sources_conflict" || item.candidateGroups.some((group) => group.conflictingSignals.length)).length;
  const questions = cases.filter((item) => item.decision?.requiresUserConfirmation).length;
  const confidence = cases.length ? clampReasoningConfidence(cases.reduce((sum, item) => sum + item.confidence, 0) / cases.length) : 0;
  return { cases, matches, conflicts, questions, confirmed: 0, stale: cases.filter((item) => item.status === "stale").length, confidence };
}

async function loadCompletedSemanticModels(supabase: SupabaseClient, userId: string, currentModel: SemanticDocumentModel) {
  const { data } = await supabase
    .from("document_semantic_readings")
    .select("result_json")
    .eq("user_id", userId)
    .in("status", ["completed", "completed_with_warnings", "manual_review_required"])
    .order("updated_at", { ascending: false })
    .limit(25);
  const models = (data ?? []).map((row: any) => row.result_json).filter(Boolean) as SemanticDocumentModel[];
  const byId = new Map<string, SemanticDocumentModel>();
  for (const model of [currentModel, ...models]) byId.set(model.id, model);
  return [...byId.values()];
}

export async function saveReasoningCases(supabase: SupabaseClient, userId: string, cases: ReasoningCase[]) {
  if (!cases.length) return [];
  const rows = cases.map((item) => ({
    user_id: userId,
    case_type: item.type,
    status: item.status,
    subject_type: item.candidateGroups[0]?.entityType ?? "unknown",
    confidence: item.confidence,
    conclusion: item.decision?.conclusion ?? "unknown",
    recommendation: item.decision?.recommendation ?? "manual_review",
    requires_user_confirmation: item.decision?.requiresUserConfirmation ?? true,
    explanation: item.decision?.explanation ?? "",
    input_version: REASONING_TAXONOMY_VERSION,
    reasoning_version: REASONING_ENGINE_VERSION,
    model_name: "pathzy-deterministic-career-reasoner",
    fingerprint: item.fingerprint,
    result_json: item,
    updated_at: new Date().toISOString()
  }));
  const { data, error } = await supabase.from("career_reasoning_cases").upsert(rows, { onConflict: "user_id,fingerprint" }).select("id,fingerprint");
  if (error) throw error;
  const idByFingerprint = new Map((data ?? []).map((row: any) => [row.fingerprint, row.id]));
  const links = cases.flatMap((item) => {
    const caseId = idByFingerprint.get(item.fingerprint);
    if (!caseId) return [];
    return item.subjectEntityIds.map((entityId) => ({
      case_id: caseId,
      semantic_entity_id: entityId,
      document_id: item.sourceDocumentIds[0] === "user_profile" ? null : item.sourceDocumentIds[0],
      role: "candidate",
      created_at: new Date().toISOString()
    }));
  });
  if (links.length) await supabase.from("career_reasoning_case_entities").upsert(links, { onConflict: "case_id,semantic_entity_id" });
  return data ?? [];
}

export async function runAndPersistCareerReasoning(supabase: SupabaseClient, input: { userId: string; semanticReading: SemanticDocumentModel; existingProfile?: Record<string, unknown> | null }) {
  const startedAt = Date.now();
  console.info("[career-reasoning] started", { userId: input.userId, documentId: input.semanticReading.documentId, semanticReadingId: input.semanticReading.id });
  const semanticModels = await loadCompletedSemanticModels(supabase, input.userId, input.semanticReading);
  const cases = await generateCareerReasoningCases({ userId: input.userId, semanticModels, existingProfile: input.existingProfile });
  await saveReasoningCases(supabase, input.userId, cases);
  const summary = summarizeReasoningCases(cases);
  console.info("[career-reasoning] completed", { userId: input.userId, cases: cases.length, questions: summary.questions, confidence: summary.confidence, durationMs: Date.now() - startedAt });
  return summary;
}

export async function recordReasoningUserDecision(supabase: SupabaseClient, input: { userId: string; caseId: string; decision: string; selectedOption?: string; customAnswer?: string; resultingAction?: string }) {
  const { data, error } = await supabase
    .from("career_reasoning_user_decisions")
    .insert({
      user_id: input.userId,
      case_id: input.caseId,
      decision: input.decision,
      selected_option: input.selectedOption ?? null,
      custom_answer: input.customAnswer ?? null,
      resulting_action: input.resultingAction ?? null
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
