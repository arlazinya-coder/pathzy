import type { CvViewConfiguration } from "@/lib/professional-documents";

export type JobIntelligenceLanguage = "en" | "fr";
export type JobSourceType = "manual" | "opportunity_catalog" | "application_tracker" | "uploaded_job_ad" | "external_link";
export type JobRequirementImportance = "mandatory" | "preferred" | "context";
export type JobRequirementCategory =
  | "role"
  | "skill"
  | "tool"
  | "technology"
  | "experience"
  | "education"
  | "certification"
  | "licence"
  | "language"
  | "location"
  | "work_authorization"
  | "availability"
  | "responsibility"
  | "culture"
  | "unknown";

export type JobRequirement = {
  id: string;
  text: string;
  normalizedText: string;
  category: JobRequirementCategory;
  importance: JobRequirementImportance;
  sourceLine?: string;
  confidence: number;
};

export type StructuredJobOpportunity = {
  id: string;
  sourceType: JobSourceType;
  sourceOpportunityId?: string;
  title?: string;
  company?: string;
  location?: string;
  employmentType?: string;
  language: JobIntelligenceLanguage;
  rawTextHash: string;
  summary: string;
  requirements: JobRequirement[];
  responsibilities: JobRequirement[];
  benefitsOrContext: JobRequirement[];
  extractedAt: string;
};

export type CanonicalEvidenceReference = {
  entityType:
    | "professional_profile"
    | "employment"
    | "education"
    | "certification"
    | "licence"
    | "skill"
    | "language"
    | "project"
    | "achievement"
    | "membership"
    | "volunteering";
  entityId: string;
  label: string;
  value: string;
  reviewStatus: "confirmed" | "user_entered" | "provisionally_accepted" | "needs_review" | "uncertain";
  confidence: number;
};

export type JobRequirementMatch = {
  requirement: JobRequirement;
  status: "matched" | "partial" | "missing" | "uncertain";
  score: number;
  explanation: string;
  evidence: CanonicalEvidenceReference[];
  questions: string[];
};

export type JobGap = {
  requirementId: string;
  requirement: string;
  importance: JobRequirementImportance;
  category: JobRequirementCategory;
  action: string;
};

export type JobRisk = {
  id: string;
  severity: "info" | "warning" | "high";
  message: string;
  userAction: string;
};

export type JobSuitability = "strong_fit" | "potential_fit" | "stretch" | "not_enough_information" | "not_recommended_yet";

export type TargetedCvPreparationPlan = {
  targetRole?: string;
  targetCompany?: string;
  targetJobId: string;
  cvConfiguration: Pick<CvViewConfiguration, "purpose" | "targetRole" | "targetJobId" | "selectedEntityIds">;
  truthfulPositioning: string[];
  evidenceToEmphasize: CanonicalEvidenceReference[];
  gapsToAddressBeforeApplying: JobGap[];
  userReviewQuestions: string[];
  blockedClaims: string[];
};

export type JobMatchAnalysis = {
  id: string;
  userId?: string;
  canonicalProfileId: string;
  profileVersion: number;
  job: StructuredJobOpportunity;
  readinessScore: number;
  suitability: JobSuitability;
  headline: string;
  strengths: JobRequirementMatch[];
  partialMatches: JobRequirementMatch[];
  gaps: JobGap[];
  uncertainties: JobRequirementMatch[];
  risks: JobRisk[];
  questionsForUser: string[];
  targetedCvPlan: TargetedCvPreparationPlan;
  nextActions: Array<{
    label: string;
    route: string;
    reason: string;
  }>;
  createdAt: string;
};

export type InspectJobAdvertisementInput = {
  sourceType?: JobSourceType;
  sourceOpportunityId?: string;
  title?: string;
  company?: string;
  location?: string;
  employmentType?: string;
  language?: JobIntelligenceLanguage;
  rawText: string;
};

