import { REASONING_THRESHOLDS } from "./reasoning.constants";
import { clampReasoningConfidence } from "./reasoning-utils";
import type { CareerReasoningProvider, CareerReasoningProviderResult, ReasoningCase, ReasoningConclusion, ReasoningDecision, ReasoningRecommendation, ReasoningSignal } from "./reasoning.types";

function conclusionFor(caseItem: ReasoningCase): ReasoningConclusion {
  const hasConflict = caseItem.candidateGroups.some((group) => group.conflictingSignals.length);
  const score = caseItem.confidence;
  if (hasConflict && score < REASONING_THRESHOLDS.mediumConfidence) return "sources_conflict";
  if (caseItem.type === "possible_promotion") return "possible_promotion";
  if (score >= REASONING_THRESHOLDS.veryHighConfidence) return "likely_same_entity";
  if (score >= REASONING_THRESHOLDS.mediumConfidence) return "possibly_same_entity";
  if (score < REASONING_THRESHOLDS.lowConfidence) return "insufficient_evidence";
  return "requires_user_confirmation";
}

function recommendationFor(conclusion: ReasoningConclusion, confidence: number): ReasoningRecommendation {
  if (conclusion === "insufficient_evidence") return "insufficient_evidence";
  if (conclusion === "sources_conflict") return "manual_review";
  if (confidence >= REASONING_THRESHOLDS.veryHighConfidence) return "ask_user";
  if (confidence >= REASONING_THRESHOLDS.mediumConfidence) return "ask_user";
  return "suggest_keep_separate";
}

function evidenceFromSignals(signals: ReasoningSignal[], direction: "supporting" | "contradicting") {
  return signals.map((signal, index) => ({
    id: `${direction}-${index + 1}`,
    direction,
    claim: signal.description,
    weight: Math.abs(signal.score),
    confidence: signal.confidence,
    source: {
      documentId: signal.sourceDocumentIds[0],
      entityIds: signal.sourceEntityIds,
      regionIds: [],
      pageNumbers: [],
      sourceType: "unknown" as const
    }
  }));
}

function explanationFromSignals(signals: ReasoningSignal[], conclusion: ReasoningConclusion) {
  const reasons = signals.filter((item) => item.direction === "supports").slice(0, 4).map((item) => item.description);
  if (!reasons.length) return "PATHZY does not have enough evidence to connect these records confidently.";
  const prefix = conclusion === "sources_conflict" ? "PATHZY found a possible information conflict because" : "PATHZY believes these records may be related because";
  return `${prefix}: ${reasons.join(" ")}`;
}

export class DeterministicCareerReasoningProvider implements CareerReasoningProvider {
  async reason(input: { case: ReasoningCase; signals: ReasoningSignal[]; records?: unknown[] }): Promise<CareerReasoningProviderResult> {
    const conclusion = conclusionFor(input.case);
    const recommendation = recommendationFor(conclusion, input.case.confidence);
    const supportingSignals = input.signals.filter((signal) => signal.direction === "supports" || signal.direction === "neutral");
    const contradictingSignals = input.signals.filter((signal) => signal.direction === "contradicts");
    const questionType = input.case.type === "possible_same_employment" ? "same_employment" : input.case.type === "possible_promotion" ? "promotion_or_title_change" : "conflicting_information";
    const decision: ReasoningDecision = {
      id: `${input.case.id}:decision`,
      caseId: input.case.id,
      conclusion,
      confidence: clampReasoningConfidence(input.case.confidence),
      recommendation,
      explanation: explanationFromSignals(input.signals, conclusion),
      supportingEvidence: evidenceFromSignals(supportingSignals, "supporting"),
      contradictingEvidence: evidenceFromSignals(contradictingSignals, "contradicting"),
      assumptions: supportingSignals
        .filter((signal) => ["same_normalized_organisation", "semantic_title_similarity"].includes(signal.type))
        .map((signal, index) => ({ id: `assumption-${index + 1}`, description: signal.description, confidence: signal.confidence, requiresUserConfirmation: true })),
      unresolvedQuestions: recommendation === "ask_user" || recommendation === "manual_review"
        ? [{
            id: `${input.case.id}:question`,
            type: questionType,
            prompt: input.case.type === "possible_same_employment"
              ? "Were these records describing the same employment, separate roles, or a title change?"
              : "How should PATHZY treat these related career records?",
            options: [
              { value: "same_entity", label: "Yes, these are the same employment." },
              { value: "separate", label: "No, these are separate roles." },
              { value: "promotion", label: "This was a promotion." },
              { value: "title_change", label: "Only the title changed." },
              { value: "incorrect_source", label: "One record is incorrect." },
              { value: "not_sure", label: "I am not sure." }
            ],
            allowCustomAnswer: true,
            relatedEntityIds: input.case.subjectEntityIds
          }]
        : [],
      proposedActions: recommendation === "suggest_keep_separate" || recommendation === "insufficient_evidence"
        ? []
        : [{ id: `${input.case.id}:merge`, type: input.case.type === "possible_promotion" ? "mark_promotion" : "merge_entities", label: "Review this possible match", reversible: true, requiresUserConfirmation: true }],
      requiresUserConfirmation: recommendation !== "ignore" && recommendation !== "auto_accept_safe_metadata",
      reversible: true
    };
    return { decision };
  }
}

export class OpenAICareerReasoningProvider implements CareerReasoningProvider {
  async reason(): Promise<CareerReasoningProviderResult> {
    throw new Error("OpenAI career reasoning is not enabled for Phase 5 deterministic rollout.");
  }
}

export function buildCareerReasoningPrompt() {
  return [
    "Evaluate whether these structured career records refer to the same real-world career event or separate events.",
    "Use only supplied evidence. Do not invent facts. Do not mutate the profile.",
    "Return structured conclusion, confidence, evidence, assumptions, recommended user action, explanation, and clarification question."
  ].join("\n");
}
