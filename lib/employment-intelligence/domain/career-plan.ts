import type { ConfidenceAssessment } from "./confidence";
import type { EvidenceRecord } from "./evidence";
import type { ActionEffort, ActionUrgency } from "./next-best-action";

export const careerPlanHorizons = ["TODAY", "THIS_WEEK", "THIS_MONTH", "NEXT_3_MONTHS", "LONGER_TERM"] as const;
export type CareerPlanHorizon = (typeof careerPlanHorizons)[number];

export const careerPlanStepStates = ["NOT_STARTED", "IN_PROGRESS", "BLOCKED", "COMPLETED", "SKIPPED"] as const;
export type CareerPlanStepState = (typeof careerPlanStepStates)[number];

export type CareerPlanStep = {
  id: string;
  horizon: CareerPlanHorizon;
  action: string;
  reason: string;
  pathzySupportFeature: string;
  dependency?: string;
  measurableOutcome: string;
  state: CareerPlanStepState;
  urgency: ActionUrgency;
  effort: ActionEffort;
  evidence: EvidenceRecord[];
  confidence: ConfidenceAssessment;
};

export type CareerPlan = {
  generatedAt: string;
  engineVersion: string;
  pathwayCode?: string;
  supportIntensity: string;
  steps: CareerPlanStep[];
};
