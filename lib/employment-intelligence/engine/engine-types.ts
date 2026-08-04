import type { BarrierCategory, BarrierSeverity, DetectedBarrier } from "../domain/barriers";
import type { ConfidenceAssessment, ConfidenceLevel } from "../domain/confidence";
import type { EvidenceRecord, InputProvenanceState } from "../domain/evidence";
import type { JobLevel } from "../domain/job-levels";
import type { ActionEffort, ActionUrgency } from "../domain/next-best-action";
import type { PathwayCode, PathwayRecommendation } from "../domain/pathways";
import type { ReadinessBand, ReadinessDimensionKey } from "../domain/readiness";
import type { SupportIntensityLevel } from "../domain/support-intensity";

export type EngineContext = {
  assessedAt: string;
  engineVersion?: string;
};

export type NormalizationIssue = {
  code: string;
  field: string;
  reason: string;
};

export type NormalizationReport = {
  issues: NormalizationIssue[];
  duplicateFieldsNormalized: string[];
  declinedFields: string[];
  unknownFields: string[];
};

export type EmploymentSignal = {
  code: string;
  value: string | number | boolean | string[];
  provenance: InputProvenanceState;
  confidence: ConfidenceAssessment;
  sourceReferences: string[];
  missingData: string[];
  conflictingData: string[];
  sensitivity: "LOW" | "MODERATE" | "HIGH";
};

export type EvidenceAssessment = {
  code: string;
  subject: string;
  evidence: EvidenceRecord[];
  confidence: ConfidenceAssessment;
  verified: boolean;
  gaps: string[];
  unsupportedClaims: string[];
  conflicts: string[];
};

export type EvidenceAssessmentSummary = {
  assessments: EvidenceAssessment[];
  evidenceGaps: string[];
  strongestSupportedAssets: EvidenceRecord[];
  unsupportedClaims: string[];
  conflicts: string[];
  overallEvidenceConfidence: ConfidenceAssessment;
};

export type MissingInformationImportance = "OPTIONAL" | "USEFUL" | "IMPORTANT" | "REQUIRED_FOR_ASSESSMENT";

export type MissingInformation = {
  code: string;
  affectedReadinessDimensions: ReadinessDimensionKey[];
  importance: MissingInformationImportance;
  reason: string;
  resolutionAction: string;
  userDeclined: boolean;
  blocksConclusion: boolean;
  explanationKey: string;
};

export type Strength = {
  code: string;
  evidence: EvidenceRecord[];
  confidence: ConfidenceAssessment;
  relevance: string;
  suitablePathwayConnections: PathwayCode[];
  explanationKey: string;
};

export type PathwaySuitability = NonNullable<PathwayRecommendation["suitability"]>;

export type PathwayEvaluation = Required<Pick<PathwayRecommendation, "pathwayCode" | "rank" | "suitability" | "reason" | "confidence" | "dependencies" | "barriers" | "unmetDependencies" | "missingInformation" | "timeHorizon" | "urgencySuitability">> & {
  supportingSignals: string[];
  explanation: string;
};

export type JobLevelIndication = {
  level: JobLevel;
  confidence: ConfidenceAssessment;
  evidence: EvidenceRecord[];
  missingInformation: string[];
  explanationKey: string;
};

export type SupportIntensitySelection = {
  level: SupportIntensityLevel;
  confidence: ConfidenceAssessment;
  reasons: string[];
  explanationKey: string;
};

export type DimensionRule = {
  key: ReadinessDimensionKey;
  inputs: string[];
  thresholds: string[];
  caps: string[];
  unknownHandling: string;
  evidenceHandling: string;
  falsePositiveRisk: string;
};

export type PreliminaryAction = {
  code: string;
  title: string;
  urgency: ActionUrgency;
  effort: ActionEffort;
  route: string;
  reason: string;
};

export type EngineIntermediateState = {
  normalizationReport: NormalizationReport;
  signals: EmploymentSignal[];
  evidenceSummary: EvidenceAssessmentSummary;
  missingInformation: MissingInformation[];
  barriers: DetectedBarrier[];
  strengths: Strength[];
  pathwayEvaluations: PathwayEvaluation[];
  jobLevelIndications: JobLevelIndication[];
  supportIntensity: SupportIntensitySelection;
};

export function confidenceLevelFromScore(score: number): ConfidenceLevel {
  if (score >= 0.85) return "VERY_HIGH";
  if (score >= 0.68) return "HIGH";
  if (score >= 0.45) return "MEDIUM";
  if (score >= 0.22) return "LOW";
  return "VERY_LOW";
}

export function bandFromScore(score: number, unknown = false): ReadinessBand {
  if (unknown) return "NOT_ASSESSED";
  if (score >= 88) return "STRONG";
  if (score >= 72) return "READY";
  if (score >= 56) return "READY_WITH_SUPPORT";
  if (score >= 34) return "DEVELOPING";
  return "NEEDS_FOUNDATION";
}

export function severityWeight(severity: BarrierSeverity) {
  if (severity === "CRITICAL") return 5;
  if (severity === "HIGH") return 4;
  if (severity === "MODERATE") return 3;
  if (severity === "LOW") return 2;
  return 1;
}

export function barrierCategoryForCode(code: string): BarrierCategory {
  if (/AUTHORIZATION|DOCUMENT|LICENCE/.test(code)) return "LEGAL_AND_DOCUMENTATION";
  if (/TRANSPORT|INTERNET|DEVICE|CARE/.test(code)) return "PRACTICAL_ACCESS";
  if (/CONFIDENCE|LITERACY|SUPPORT/.test(code)) return "CONFIDENCE_AND_SUPPORT";
  if (/APPLICATION|SEARCH|CV|INTERVIEW/.test(code)) return "JOB_SEARCH";
  if (/QUALIFICATION|EDUCATION/.test(code)) return "QUALIFICATION";
  if (/COMMUNICATION|LANGUAGE/.test(code)) return "COMMUNICATION";
  if (/MARKET|STRUCTURAL/.test(code)) return "MARKET_AND_STRUCTURAL";
  return "PROFILE_AND_EVIDENCE";
}
