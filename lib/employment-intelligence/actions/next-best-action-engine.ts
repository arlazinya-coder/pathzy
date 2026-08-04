import type { NextBestAction, NextBestActionSet } from "../domain/next-best-action";
import { EMPLOYMENT_ACTION_ENGINE_VERSION_3E } from "./action-version";
import type { ActionCandidate, NextActionEngineInput } from "./action-models";
import { explainActionCandidate, actionReason } from "./action-explainability";
import { evaluateActionEligibility } from "./action-eligibility";
import { orderActionCandidates } from "./action-priority";
import { pathzyActionRegistry } from "./action-registry";
import { selectSecondaryActionCandidates } from "./secondary-action-selector";

function toNextBestAction(candidate: ActionCandidate): NextBestAction {
  return {
    actionCode: candidate.definition.code,
    title: candidate.definition.title,
    plainLanguageExplanation: explainActionCandidate(candidate),
    reason: actionReason(candidate),
    urgency: candidate.definition.urgency,
    expectedImpact: candidate.definition.plainLanguageExplanation,
    estimatedEffort: candidate.definition.effort,
    prerequisites: candidate.definition.prerequisites,
    blockedBy: candidate.blockers,
    destination: candidate.definition.destination,
    supportingEvidence: candidate.evidence,
    confidence: candidate.confidence,
    completionCriteria: candidate.definition.completionCriteria,
    sourceEngineVersion: EMPLOYMENT_ACTION_ENGINE_VERSION_3E,
    category: candidate.definition.category,
    state: candidate.state,
    impact: candidate.definition.impact,
    reasonCodes: candidate.definition.reasonCodes,
    priorityBreakdown: candidate.priorityBreakdown,
    presentationMode: candidate.definition.presentationMode
  };
}

function fallbackAction(input: NextActionEngineInput): NextBestAction {
  const fallback = pathzyActionRegistry.find((action) => action.code === "COMPLETE_EMPLOYMENT_DIAGNOSIS") ?? pathzyActionRegistry[0];
  return toNextBestAction(evaluateActionEligibility(fallback, input));
}

export function determineNextBestActions(input: NextActionEngineInput): NextBestActionSet {
  const candidates = pathzyActionRegistry.map((action) => evaluateActionEligibility(action, input));
  const ordered = orderActionCandidates(candidates).filter((candidate) => candidate.state !== "ALREADY_COMPLETED" && candidate.state !== "NOT_RELEVANT");
  const primaryCandidate = ordered.find((candidate) => candidate.state === "ELIGIBLE") ?? ordered[0];
  const primary = primaryCandidate ? toNextBestAction(primaryCandidate) : fallbackAction(input);
  const secondary = selectSecondaryActionCandidates(candidates, primary.actionCode, 3).map(toNextBestAction);
  return { primary, secondary };
}

export function determineNextActionCandidates(input: NextActionEngineInput) {
  return pathzyActionRegistry.map((action) => evaluateActionEligibility(action, input));
}
