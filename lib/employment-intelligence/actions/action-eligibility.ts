import { createConfidenceAssessment } from "../engine/calculate-confidence";
import type { ActionCandidate, ActionDefinition, NextActionEngineInput } from "./action-models";
import { completedActionCodes, isActionCompleted } from "./action-completion";
import { unmetActionDependencies } from "./action-dependencies";
import { scoreActionPriority } from "./action-priority";

function actionHasSignal(action: ActionDefinition, input: NextActionEngineInput) {
  const barrierCodes = input.intelligenceProfile.barriers.map((barrier) => barrier.definitionCode);
  const pathwayCodes = input.intelligenceProfile.pathwayRecommendations.map((pathway) => pathway.pathwayCode);
  const diagnosisCodes = [
    ...(input.diagnosisResult?.summaryCodes ?? []),
    ...(input.diagnosisResult?.immediateNeeds ?? []),
    ...(input.diagnosisResult?.evidenceGaps ?? []),
    ...(input.diagnosisResult?.majorBarriers.map((barrier) => barrier.code) ?? []),
    ...(input.diagnosisResult?.supportNeeds ?? []),
    input.diagnosisResult?.diagnosisStatus ?? ""
  ].filter(Boolean);
  if (action.code === "COMPLETE_EMPLOYMENT_DIAGNOSIS" && (!input.diagnosisResult || input.diagnosisResult.diagnosisStatus !== "ENOUGH_FOR_INTELLIGENCE")) {
    return true;
  }
  if (action.code === "CREATE_FIRST_CV" && !input.documentState?.hasCv && !input.intelligenceProfile.missingInformation.includes("INCOMPLETE_PROFESSIONAL_IDENTITY")) {
    return true;
  }
  return (
    action.barrierSignals.some((signal) => barrierCodes.includes(signal)) ||
    action.pathwaySignals.some((signal) => pathwayCodes.map(String).includes(signal)) ||
    action.missingInformationSignals.some((signal) => input.intelligenceProfile.missingInformation.includes(signal)) ||
    action.diagnosisSignals.some((signal) => diagnosisCodes.includes(signal))
  );
}

export function evaluateActionEligibility(action: ActionDefinition, input: NextActionEngineInput): ActionCandidate {
  const completed = completedActionCodes(input.actionHistory, input.documentState);
  const blockers = unmetActionDependencies(action, completed);
  const alreadyCompleted = isActionCompleted(action, completed);
  const state = alreadyCompleted ? "ALREADY_COMPLETED" : blockers.length ? "BLOCKED" : actionHasSignal(action, input) ? "ELIGIBLE" : "DEFERRED";
  const { priorityScore, priorityBreakdown } = scoreActionPriority(action, input, blockers, alreadyCompleted);
  return {
    definition: action,
    state,
    priorityScore,
    priorityBreakdown,
    blockers,
    reasons: [
      ...action.reasonCodes,
      ...(blockers.length ? [`blocked_by:${blockers.join(",")}`] : []),
      ...(alreadyCompleted ? ["already_completed"] : [])
    ],
    evidence: input.intelligenceProfile.barriers.flatMap((barrier) => barrier.evidence),
    confidence: createConfidenceAssessment({
      completeness: input.intelligenceProfile.confidence.inputCompleteness,
      evidence: input.intelligenceProfile.confidence.evidenceQuality,
      ruleCertainty: 0.78,
      countryContext: input.intelligenceProfile.confidence.countryContextQuality,
      rationale: ["phase3e.action.eligibility", ...action.reasonCodes]
    })
  };
}
