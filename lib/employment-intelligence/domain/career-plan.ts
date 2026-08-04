import type { ConfidenceAssessment } from "./confidence";
import type { EvidenceRecord } from "./evidence";
import type { ActionEffort, ActionUrgency } from "./next-best-action";

export const careerPlanHorizons = ["TODAY", "THIS_WEEK", "THIS_MONTH", "NEXT_3_MONTHS", "LONGER_TERM"] as const;
export type CareerPlanHorizon = (typeof careerPlanHorizons)[number];

export const careerPlanStepStates = ["NOT_STARTED", "IN_PROGRESS", "BLOCKED", "COMPLETED", "SKIPPED"] as const;
export type CareerPlanStepState = (typeof careerPlanStepStates)[number];

export type CareerPlanStep = {
  id: string;
  stepId?: string;
  actionCode?: string;
  horizon: CareerPlanHorizon;
  action: string;
  title?: string;
  titleKey?: string;
  explanationKey?: string;
  reason: string;
  reasonCodes?: string[];
  pathzySupportFeature: string;
  dependency?: string;
  dependencies?: string[];
  dependencyCodes?: string[];
  measurableOutcome: string;
  expectedOutcome?: string;
  completionCriteria?: string[];
  supportRoute?: string;
  state: CareerPlanStepState;
  urgency: ActionUrgency;
  effort: ActionEffort;
  evidence: EvidenceRecord[];
  confidence: ConfidenceAssessment;
  sourceEngineVersion?: string;
};

export type CareerPlan = {
  id?: string;
  userId?: string;
  version?: number;
  generatedAt: string;
  engineVersion: string;
  inputIntelligenceVersion?: string;
  pathwayCode?: string;
  primaryPathway?: string;
  immediateGoal?: string;
  longTermGoal?: string;
  horizons?: CareerPlanHorizon[];
  dependencies?: Record<string, string[]>;
  progress?: {
    completedSteps: number;
    totalSteps: number;
  };
  confidence?: ConfidenceAssessment;
  explanations?: string[];
  status?: "DRAFT" | "ACTIVE" | "NEEDS_MORE_INFORMATION" | "STALE";
  supportIntensity: string;
  planStatus?: "DRAFT" | "ACTIVE" | "NEEDS_MORE_INFORMATION" | "STALE";
  primaryActionCode?: string;
  actionRegistryVersion?: string;
  steps: CareerPlanStep[];
  dependencyGraph?: Record<string, string[]>;
  staleStatus?: "CURRENT" | "STALE" | "NEEDS_REVIEW";
};
