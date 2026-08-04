import type { EmploymentDiagnosisResult } from "../diagnosis/diagnosis-models";
import type { DetectedBarrier } from "../domain/barriers";
import type { ConfidenceAssessment } from "../domain/confidence";
import type { EvidenceRecord } from "../domain/evidence";
import type { PathwayRecommendation } from "../domain/pathways";
import type { ReadinessDimensionAssessment } from "../domain/readiness";
import type { SupportIntensityLevel } from "../domain/support-intensity";
import type { ActionEffort, ActionUrgency, NextBestAction } from "../domain/next-best-action";

export const nextActionCategories = [
  "IDENTITY_COMPLETION",
  "EVIDENCE_BUILDING",
  "EVIDENCE_STRENGTHENING",
  "EMPLOYMENT_DIAGNOSIS",
  "DOCUMENT_PREPARATION",
  "CAREER_DIRECTION",
  "WORK_ELIGIBILITY",
  "PRACTICAL_ACCESS",
  "DIGITAL_ACCESS",
  "JOB_SEARCH",
  "APPLICATION_PREPARATION",
  "INTERVIEW_PREPARATION",
  "OPPORTUNITY_EXPLORATION",
  "QUALIFICATION_RECOGNITION",
  "LICENCE_OR_REGISTRATION",
  "NETWORKING",
  "FOLLOW_UP",
  "IMMEDIATE_INCOME",
  "SELF_EMPLOYMENT",
  "SKILL_DEVELOPMENT",
  "PRACTICAL_SUPPORT",
  "PATHWAY_EXPLORATION",
  "SUPPORT_AND_GUIDANCE",
  "HUMAN_SUPPORT"
] as const;

export type NextActionCategory = (typeof nextActionCategories)[number];

export const actionImpactLevels = ["LOW", "MEDIUM", "HIGH", "FOUNDATIONAL", "URGENT_SUPPORT"] as const;
export type ActionImpactLevel = (typeof actionImpactLevels)[number];

export const actionStates = ["ELIGIBLE", "BLOCKED", "ALREADY_COMPLETED", "NOT_RELEVANT", "DEFERRED"] as const;
export type ActionState = (typeof actionStates)[number];

export const actionLifecycleStates = ["NOT_STARTED", "READY", "BLOCKED", "IN_PROGRESS", "COMPLETED", "SKIPPED", "EXPIRED"] as const;
export type ActionLifecycleState = (typeof actionLifecycleStates)[number];

export const actionRecommendationStaleStates = [
  "CURRENT",
  "STALE_IDENTITY_CHANGED",
  "STALE_DIAGNOSIS_CHANGED",
  "STALE_INTELLIGENCE_CHANGED",
  "STALE_ACTION_HISTORY_CHANGED",
  "STALE_COUNTRY_CONTEXT_CHANGED",
  "STALE_ENGINE_CHANGED",
  "RECOMPUTING",
  "FAILED_RECOMPUTE"
] as const;
export type ActionRecommendationStaleState = (typeof actionRecommendationStaleStates)[number];

export const actionRepeatability = ["ONCE", "WHEN_STALE", "PER_OPPORTUNITY", "ONGOING"] as const;
export type ActionRepeatability = (typeof actionRepeatability)[number];

export const actionPresentationModes = ["STANDARD", "PLAIN_LANGUAGE", "HIGH_GUIDANCE", "ASSISTED"] as const;
export type ActionPresentationMode = (typeof actionPresentationModes)[number];

export type ActionDestination = {
  route: string;
  action?: string;
};

export type ActionDefinition = {
  code: string;
  category: NextActionCategory;
  title: string;
  titleKey?: string;
  plainLanguageExplanation: string;
  explanationKey?: string;
  reasonCodes: string[];
  urgency: ActionUrgency;
  effort: ActionEffort;
  impact: ActionImpactLevel;
  repeatability: ActionRepeatability;
  destination: ActionDestination;
  route?: string;
  prerequisites: string[];
  blockedByActionCodes: string[];
  affectedReadinessDimensions?: string[];
  addressedBarrierCodes?: string[];
  supportedPathwayCodes?: string[];
  completionCriteria: string[];
  eligibilityRules?: string[];
  contraindications?: string[];
  supportIntensityCompatibility?: SupportIntensityLevel[];
  countryContextRequirements?: string[];
  evidenceSignals: string[];
  evidenceReferences?: string[];
  pathwaySignals: string[];
  barrierSignals: string[];
  missingInformationSignals: string[];
  diagnosisSignals: string[];
  presentationMode: ActionPresentationMode;
  confidence?: ConfidenceAssessment;
  engineVersion?: string;
};

export type ActionHistoryItem = {
  actionCode: string;
  state: ActionLifecycleState;
  startedAt?: string | null;
  completedAt?: string | null;
  skippedAt?: string | null;
  skipReason?: string | null;
  lastRecommendedAt?: string | null;
  recommendationCount?: number;
  sourceEngineVersion?: string;
  evidence?: EvidenceRecord[];
  completionProof?: string[];
  userFeedback?: "HELPFUL" | "NOT_NOW" | "NOT_RELEVANT" | "CONFUSING";
  updatedAt?: string | null;
};

export type ActionDocumentState = {
  hasCv?: boolean;
  hasCoverLetter?: boolean;
  hasLinkedInDraft?: boolean;
  hasTargetOpportunity?: boolean;
  hasSubmittedApplication?: boolean;
  hasInterview?: boolean;
};

export type ActionProfileContext = {
  userId: string;
  engineVersion: string;
  generatedAt: string;
  readinessDimensions: ReadinessDimensionAssessment[];
  barriers: DetectedBarrier[];
  evidenceGaps: string[];
  pathwayRecommendations: PathwayRecommendation[];
  supportIntensity: SupportIntensityLevel;
  missingInformation: string[];
  confidence: ConfidenceAssessment;
};

export type NextActionEngineInput = {
  intelligenceProfile: ActionProfileContext;
  diagnosisResult?: EmploymentDiagnosisResult | null;
  documentState?: ActionDocumentState;
  actionHistory?: ActionHistoryItem[];
};

export type ActionCandidate = {
  definition: ActionDefinition;
  state: ActionState;
  priorityScore: number;
  priorityBreakdown: Record<string, number>;
  blockers: string[];
  reasons: string[];
  evidence: EvidenceRecord[];
  confidence: ConfidenceAssessment;
};

export type CareerPlanDependency = {
  stepId: string;
  dependsOnStepId?: string;
  dependsOnActionCode?: string;
  reason: string;
};

export type ActionSelectionResult = {
  nextBestAction: NextBestAction;
  secondaryActions: NextBestAction[];
  candidates: ActionCandidate[];
};
