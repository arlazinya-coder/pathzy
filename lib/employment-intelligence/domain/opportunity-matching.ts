import type { ConfidenceAssessment } from "./confidence";
import type { EvidenceRecord } from "./evidence";
import type { JobLevel } from "./job-levels";
import type { ReadinessDimensionKey } from "./readiness";

export const candidateContextCodes = [
  "NO_FORMAL_EXPERIENCE",
  "GRADUATE_OR_EMERGING_TALENT",
  "ENTRY_LEVEL",
  "EXPERIENCED_PROFESSIONAL",
  "SENIOR_PROFESSIONAL",
  "CAREER_CHANGER",
  "VOCATIONAL_OR_TRADE",
  "SERVICE_OR_FRONTLINE",
  "INFORMAL_WORK_BACKGROUND",
  "PROJECT_HEAVY_PROFILE"
] as const;

export type CandidateContextCode = (typeof candidateContextCodes)[number];

export type CandidateContextAssessment = {
  primaryContexts: CandidateContextCode[];
  secondaryContexts: CandidateContextCode[];
  weightingNotes: string[];
  evidence: EvidenceRecord[];
  confidence: ConfidenceAssessment;
};

export type CareerDirection = {
  primaryTargets: string[];
  adjacentTargets: string[];
  exploratoryTargets: string[];
  confidence: ConfidenceAssessment;
  reasoning: string[];
  evidence: EvidenceRecord[];
};

export const normalizedSkillCategories = [
  "CORE_PROFESSIONAL",
  "TECHNICAL",
  "TRANSFERABLE",
  "DOMAIN",
  "TOOLS_AND_PLATFORMS",
  "LANGUAGE",
  "LICENCE_OR_CERTIFICATION"
] as const;

export type NormalizedSkillCategory = (typeof normalizedSkillCategories)[number];

export type NormalizedSkillEvidenceState =
  | "USER_DECLARED"
  | "EXPERIENCE_EVIDENCED"
  | "PROJECT_EVIDENCED"
  | "QUALIFICATION_SUPPORTED"
  | "CERTIFICATION_SUPPORTED"
  | "CAREFULLY_INFERRED";

export type NormalizedSkillEvidence = {
  canonicalName: string;
  aliases: string[];
  category: NormalizedSkillCategory;
  evidenceStates: NormalizedSkillEvidenceState[];
  evidence: EvidenceRecord[];
  confidence: ConfidenceAssessment;
  unsupportedClaim: boolean;
};

export type SkillIntelligenceSummary = {
  normalizedSkills: NormalizedSkillEvidence[];
  strongestSkills: NormalizedSkillEvidence[];
  skillsNeedingEvidence: NormalizedSkillEvidence[];
  equivalenceRulesApplied: string[];
};

export type JobOpportunityFreshness = "ACTIVE" | "EXPIRED" | "UNKNOWN";

export type JobOpportunityRequirement = {
  id: string;
  label: string;
  category:
    | "SKILL"
    | "EXPERIENCE"
    | "EDUCATION"
    | "LICENCE"
    | "LANGUAGE"
    | "WORK_AUTHORIZATION"
    | "LOCATION"
    | "AVAILABILITY"
    | "EMPLOYMENT_TYPE"
    | "SALARY"
    | "OTHER";
  importance: "MANDATORY" | "PREFERRED" | "OPTIONAL" | "UNCLEAR";
};

export type NormalizedJobOpportunity = {
  id: string;
  source: string;
  externalId?: string;
  title: string;
  employer: string;
  description?: string;
  location?: string;
  remoteType?: "ONSITE" | "HYBRID" | "REMOTE" | "UNKNOWN";
  employmentType?: string;
  salary?: string;
  postedDate?: string;
  closingDate?: string;
  requirements: JobOpportunityRequirement[];
  requiredSkills: string[];
  preferredSkills: string[];
  requiredEducation: string[];
  requiredExperience?: string;
  licences: string[];
  languages: string[];
  workAuthorizationRequirements?: string[];
  applicationUrl?: string;
  lastVerifiedAt?: string;
  status: JobOpportunityFreshness;
};

export type OpportunityMatch = {
  jobId: string;
  eligibilityStatus: "ELIGIBLE" | "CONDITIONAL" | "BLOCKED" | "UNKNOWN";
  suitabilityScore: number;
  suitabilityLabel: "LOW" | "POSSIBLE" | "STRONG" | "EXCELLENT";
  confidence: ConfidenceAssessment;
  strongestMatches: Array<{ requirementId?: string; label: string; evidence: EvidenceRecord[] }>;
  gaps: Array<{ requirementId?: string; label: string; type: "MISSING_INFORMATION" | "DEVELOPMENT_GAP" | "WEAK_EVIDENCE" }>;
  criticalBarriers: Array<{ requirementId?: string; label: string; reason: string }>;
  reasons: string[];
  recommendedAction: "WORTH_APPLYING" | "APPLY_WITH_REVIEW" | "PREPARE_FIRST" | "DO_NOT_RECOMMEND_NOW";
  dimensions: Partial<Record<ReadinessDimensionKey | "TARGET_ROLE_ALIGNMENT" | "LOCATION_ALIGNMENT" | "SALARY_ALIGNMENT", "STRONG" | "PARTIAL" | "WEAK" | "UNKNOWN">>;
};

export type OpportunityMatcherContract = {
  version: string;
  consumes: "EmploymentIntelligenceProfile";
  candidateContexts: CandidateContextCode[];
  careerTargets: string[];
  skillNames: string[];
  suitableJobLevels: JobLevel[];
  matchDimensions: string[];
  freshnessRule: "Do not recommend expired opportunities as current.";
  feedbackPrepared: {
    positive: "RELEVANT";
    negative: "NOT_FOR_ME";
    reasons: string[];
  };
};
