export const confidenceLevels = ["VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"] as const;

export type ConfidenceLevel = (typeof confidenceLevels)[number];

export type ConfidenceAssessment = {
  level: ConfidenceLevel;
  rationale: string[];
  inputCompleteness: number;
  evidenceQuality: number;
  ruleCertainty: number;
  countryContextQuality: number;
  recency: number;
  conflictingInformation: string[];
};

export function isConfidenceLevel(value: unknown): value is ConfidenceLevel {
  return typeof value === "string" && confidenceLevels.includes(value as ConfidenceLevel);
}
