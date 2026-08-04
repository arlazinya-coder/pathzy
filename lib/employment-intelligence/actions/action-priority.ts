import type { ActionCandidate, ActionDefinition, NextActionEngineInput } from "./action-models";

export const actionPriorityWeights = {
  urgency: {
    WHEN_READY: 0,
    LOW: 8,
    MEDIUM: 18,
    HIGH: 30,
    IMMEDIATE: 42
  },
  impact: {
    LOW: 3,
    MEDIUM: 10,
    HIGH: 18,
    FOUNDATIONAL: 28,
    URGENT_SUPPORT: 34
  },
  effort: {
    VERY_LOW: 10,
    LOW: 8,
    MEDIUM: 3,
    HIGH: 0
  },
  supportIntensity: {
    SELF_GUIDED: 0,
    LIGHT_GUIDANCE: 4,
    STRUCTURED_GUIDANCE: 8,
    HIGH_SUPPORT: 12,
    HUMAN_SUPPORT_RECOMMENDED: 16
  },
  relevanceSignal: 10,
  blockedPenalty: -60,
  alreadyCompletedPenalty: -100,
  duplicateSecondaryPenalty: -12
} as const;

function intersects(source: string[], targets: string[]) {
  return targets.some((target) => source.includes(target));
}

export function scoreActionPriority(action: ActionDefinition, input: NextActionEngineInput, blockers: string[], alreadyCompleted: boolean) {
  const barrierCodes = input.intelligenceProfile.barriers.map((barrier) => barrier.definitionCode);
  const pathwayCodes = input.intelligenceProfile.pathwayRecommendations.map((pathway) => pathway.pathwayCode);
  const diagnosisCodes = [
    ...(input.diagnosisResult?.summaryCodes ?? []),
    ...(input.diagnosisResult?.immediateNeeds ?? []),
    ...(input.diagnosisResult?.evidenceGaps ?? []),
    ...(input.diagnosisResult?.majorBarriers.map((barrier) => barrier.code) ?? []),
    ...(input.diagnosisResult?.supportNeeds ?? [])
  ];
  const missingCodes = input.intelligenceProfile.missingInformation;

  const relevance =
    (intersects(barrierCodes, action.barrierSignals) ? actionPriorityWeights.relevanceSignal : 0) +
    (intersects(pathwayCodes, action.pathwaySignals) ? actionPriorityWeights.relevanceSignal : 0) +
    (intersects(diagnosisCodes, action.diagnosisSignals) ? actionPriorityWeights.relevanceSignal : 0) +
    (intersects(missingCodes, action.missingInformationSignals) ? actionPriorityWeights.relevanceSignal : 0);

  const priorityBreakdown = {
    urgency: actionPriorityWeights.urgency[action.urgency],
    impact: actionPriorityWeights.impact[action.impact],
    effort: actionPriorityWeights.effort[action.effort],
    supportIntensity: actionPriorityWeights.supportIntensity[input.intelligenceProfile.supportIntensity],
    relevance,
    blockers: blockers.length ? actionPriorityWeights.blockedPenalty : 0,
    completed: alreadyCompleted ? actionPriorityWeights.alreadyCompletedPenalty : 0
  };

  return {
    priorityScore: Object.values(priorityBreakdown).reduce((sum, value) => sum + value, 0),
    priorityBreakdown
  };
}

export function orderActionCandidates(candidates: ActionCandidate[]) {
  return [...candidates].sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    if (a.definition.urgency !== b.definition.urgency) return a.definition.urgency.localeCompare(b.definition.urgency);
    return a.definition.code.localeCompare(b.definition.code);
  });
}
