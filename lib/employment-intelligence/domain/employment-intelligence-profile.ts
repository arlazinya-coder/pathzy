import type { DetectedBarrier } from "./barriers";
import type { CareerPlan } from "./career-plan";
import type { ConfidenceAssessment } from "./confidence";
import type { CountryEmploymentContext } from "./country-context";
import type { EvidenceRecord } from "./evidence";
import type { Explanation } from "./explainability";
import type { JobLevel } from "./job-levels";
import type { NextBestAction } from "./next-best-action";
import type { PathwayRecommendation } from "./pathways";
import type { OverallReadinessSummary, ReadinessDimensionAssessment } from "./readiness";
import type { EmploymentIntelligenceStaleStatus } from "./stale-status";
import type { SupportIntensityLevel } from "./support-intensity";

export const EMPLOYMENT_INTELLIGENCE_ENGINE_VERSION = "phase3a.domain-contract.v1";

export type EmploymentIntelligenceProfile = {
  id: string;
  userId: string;
  version: number;
  engineVersion: string;
  generatedAt: string;
  inputSnapshotVersion: string;
  countryContext: Pick<CountryEmploymentContext, "countryCode" | "version" | "effectiveDate" | "dataFreshness">;
  readinessDimensions: ReadinessDimensionAssessment[];
  overallReadiness: OverallReadinessSummary;
  strengths: EvidenceRecord[];
  barriers: DetectedBarrier[];
  evidenceGaps: string[];
  pathwayRecommendations: PathwayRecommendation[];
  suitableRoleFamilies: string[];
  suitableJobLevels: JobLevel[];
  supportIntensity: SupportIntensityLevel;
  nextBestAction: NextBestAction;
  secondaryActions: NextBestAction[];
  careerPlan: CareerPlan;
  explanations: Explanation[];
  confidence: ConfidenceAssessment;
  missingInformation: string[];
  staleStatus: EmploymentIntelligenceStaleStatus;
  staleReason?: string;
  sensitivity: {
    safeForHome: string[];
    safeForCareerCoach: string[];
    safeForDocuments: string[];
    sensitiveInternalOnly: string[];
  };
};

export type EmploymentIntelligenceRepository = {
  getCurrent(userId: string): Promise<EmploymentIntelligenceProfile | null>;
  saveReplacement(userId: string, profile: EmploymentIntelligenceProfile): Promise<EmploymentIntelligenceProfile>;
  markStale(userId: string, status: EmploymentIntelligenceStaleStatus, reason: string): Promise<void>;
};
