import type { ConfidenceAssessment } from "./confidence";
import type { EvidenceRecord } from "./evidence";

export const actionUrgencyLevels = ["WHEN_READY", "LOW", "MEDIUM", "HIGH", "IMMEDIATE"] as const;
export type ActionUrgency = (typeof actionUrgencyLevels)[number];

export const actionEffortLevels = ["VERY_LOW", "LOW", "MEDIUM", "HIGH"] as const;
export type ActionEffort = (typeof actionEffortLevels)[number];

export type NextBestAction = {
  actionCode: string;
  title: string;
  plainLanguageExplanation: string;
  reason: string;
  urgency: ActionUrgency;
  expectedImpact: string;
  estimatedEffort: ActionEffort;
  prerequisites: string[];
  blockedBy: string[];
  destination: {
    route: string;
    action?: string;
  };
  supportingEvidence: EvidenceRecord[];
  confidence: ConfidenceAssessment;
  completionCriteria: string[];
  sourceEngineVersion: string;
};

export type NextBestActionSet = {
  primary: NextBestAction;
  secondary: NextBestAction[];
};

export function isValidNextBestActionSet(value: NextBestActionSet) {
  return Boolean(value.primary) && value.secondary.length <= 3;
}
