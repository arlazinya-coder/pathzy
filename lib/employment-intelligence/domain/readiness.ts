import type { ConfidenceAssessment } from "./confidence";
import type { EvidenceRecord } from "./evidence";

export const readinessBands = ["NOT_ASSESSED", "NEEDS_FOUNDATION", "DEVELOPING", "READY_WITH_SUPPORT", "READY", "STRONG"] as const;

export type ReadinessBand = (typeof readinessBands)[number];

export const readinessDimensions = [
  "IDENTITY_READINESS",
  "CAREER_DIRECTION_READINESS",
  "QUALIFICATION_READINESS",
  "EXPERIENCE_READINESS",
  "SKILLS_READINESS",
  "EVIDENCE_READINESS",
  "DOCUMENT_READINESS",
  "OPPORTUNITY_READINESS",
  "APPLICATION_READINESS",
  "INTERVIEW_READINESS",
  "DIGITAL_ACCESS_READINESS",
  "WORK_ELIGIBILITY_READINESS",
  "PRACTICAL_ACCESS_READINESS",
  "CONFIDENCE_AND_SUPPORT_READINESS"
] as const;

export type ReadinessDimensionKey = (typeof readinessDimensions)[number];

export const readinessBandDefinitions: Record<ReadinessBand, string> = {
  NOT_ASSESSED: "PATHZY has not yet assessed this dimension.",
  NEEDS_FOUNDATION: "Core information or support is needed before this dimension can guide action.",
  DEVELOPING: "The user has a useful starting point and needs focused strengthening.",
  READY_WITH_SUPPORT: "The user can move forward with targeted support or practical adjustments.",
  READY: "The user has enough confirmed information and preparation to proceed confidently.",
  STRONG: "The user has strong evidence, preparation, and clarity in this dimension."
};

export type ReadinessDimensionAssessment = {
  key: ReadinessDimensionKey;
  definition: string;
  inputsUsed: string[];
  exclusions: string[];
  band: ReadinessBand;
  optionalScore?: number;
  confidence: ConfidenceAssessment;
  evidence: EvidenceRecord[];
  missingInformation: string[];
  strengths: string[];
  barriers: string[];
  recommendedActions: string[];
  explainabilityMessage: string;
  lastAssessedAt: string;
  engineVersion: string;
};

export type OverallReadinessSummary = {
  readinessBand: ReadinessBand;
  secondaryNumericIndex?: number;
  strongestAssets: string[];
  highestImpactBarriers: string[];
  immediateEmploymentPotential: string;
  suitableJobLevels: string[];
  supportIntensity: string;
  recommendedPathway: string;
  confidence: ConfidenceAssessment;
  missingInformation: string[];
  methodologyNotes: string[];
};
