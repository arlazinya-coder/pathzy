import type { ConfidenceAssessment } from "./confidence";

export type ExplanationReason = {
  code: string;
  summary: string;
  sourceReferences: string[];
};

export type Explanation = {
  conclusionCode: string;
  summary: string;
  reasons: ExplanationReason[];
  evidenceReferences: string[];
  uncertainty: string[];
  userControlledFactors: string[];
  externalFactors: string[];
  confidence: ConfidenceAssessment;
};

export const explainabilityRules = [
  "NO_CHAIN_OF_THOUGHT_STORAGE",
  "EXPLAIN_USED_INFORMATION",
  "EXPLAIN_MISSING_INFORMATION",
  "SEPARATE_USER_CONTROLLED_AND_EXTERNAL_FACTORS",
  "CONFIDENCE_IS_REQUIRED"
] as const;
