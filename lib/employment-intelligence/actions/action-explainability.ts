import type { ActionCandidate } from "./action-models";

export function explainActionCandidate(candidate: ActionCandidate) {
  const blockerText = candidate.blockers.length ? ` It depends on: ${candidate.blockers.join(", ")}.` : "";
  return `${candidate.definition.plainLanguageExplanation}${blockerText}`;
}

export function actionReason(candidate: ActionCandidate) {
  return [
    candidate.definition.reasonCodes.join(", "),
    `urgency=${candidate.definition.urgency}`,
    `impact=${candidate.definition.impact}`,
    `effort=${candidate.definition.effort}`,
    `state=${candidate.state}`
  ].join(" | ");
}
