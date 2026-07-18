import type { CvViewConfiguration } from "@/lib/professional-documents";

export type JobIntelligenceLanguage = "en" | "fr";
export type JobSourceType = "manual" | "opportunity_catalog" | "application_tracker" | "uploaded_job_ad" | "external_link";
export type JobRequirementImportance = "mandatory" | "preferred" | "context";
export type JobImportSourceType = "pasted_text" | "manual_entry" | "uploaded_document" | "public_url" | "existing_opportunity";
export type JobImportStatus = "processing" | "review_required" | "ready" | "ocr_required" | "failed";
export type JobImportRequirementImportance = "mandatory" | "preferred" | "optional" | "unclear";
export type JobUnderstandingStatus = "processing" | "review_required" | "confirmed" | "failed";
export type RequirementMatchStatus = "confirmed_match" | "partial_match" | "transferable_match" | "not_confirmed" | "confirmed_gap" | "unclear" | "not_applicable";
export type ProfileJobFitBand = "strong_match" | "good_potential" | "possible_match" | "significant_gaps" | "insufficient_information";
export type ProfileJobReadiness = "ready_to_prepare_application" | "review_recommended" | "information_needed" | "eligibility_concern" | "not_recommended_without_changes";
export type TargetedDocumentApprovalState = "draft" | "review_required" | "approved" | "changes_requested" | "archived";
export type TargetedDocumentStaleState = "current" | "stale";
export type TargetedDocumentType = "targeted_cv" | "tailored_cover_letter" | "application_email" | "linkedin_message" | "recruiter_message";
export type JobUnderstandingRequirementType =
  | "skill"
  | "experience"
  | "education"
  | "certification"
  | "licence"
  | "language"
  | "location"
  | "work_authorization"
  | "availability"
  | "technical"
  | "behavioural"
  | "industry"
  | "travel"
  | "physical"
  | "other";
export type JobImportWarningCode =
  | "missing_job_title"
  | "missing_organisation"
  | "missing_location"
  | "missing_closing_date"
  | "missing_application_instructions"
  | "unclear_requirements"
  | "ocr_required"
  | "unsafe_url"
  | "url_fetch_unavailable"
  | "suspicious_payment_request"
  | "suspicious_personal_data_request"
  | "suspicious_shortened_link"
  | "document_warning"
  | "low_text_quality";
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

export type JobImportRequirement = {
  id: string;
  text: string;
  category: JobRequirementCategory;
  importance: JobImportRequirementImportance;
  sourceLine?: string;
  confidence: number;
};

export type JobImportPreliminaryDetails = {
  jobTitle?: string;
  organisation?: string;
  location?: string;
  employmentType?: string;
  workArrangement?: string;
  salary?: string;
  closingDate?: string;
  applicationInstructions?: string;
};

export type JobImportWarning = {
  code: JobImportWarningCode;
  severity: "info" | "warning" | "error";
  message: string;
};

export type JobImportInspection = {
  sourceType: JobImportSourceType;
  sourceLabel?: string;
  sourceUrl?: string;
  sourceDocumentId?: string;
  opportunityId?: string;
  language: JobIntelligenceLanguage | "unknown";
  layout: {
    hasResponsibilities: boolean;
    hasRequirements: boolean;
    hasApplicationInstructions: boolean;
    hasClosingDate: boolean;
  };
  preliminaryDetails: JobImportPreliminaryDetails;
  responsibilities: JobImportRequirement[];
  requirements: JobImportRequirement[];
  optionalContext: JobImportRequirement[];
  missingFields: Array<keyof JobImportPreliminaryDetails>;
  warnings: JobImportWarning[];
  rawTextHash: string;
  inspectedAt: string;
};

export type JobImportRecord = {
  id: string;
  userId: string;
  status: JobImportStatus;
  sourceType: JobImportSourceType;
  sourceLabel?: string;
  sourceUrl?: string;
  sourceDocumentId?: string;
  opportunityId?: string;
  rawText?: string;
  normalizedText?: string;
  language: JobIntelligenceLanguage | "unknown";
  inspection: JobImportInspection;
  userCorrections?: Partial<JobImportPreliminaryDetails>;
  createdAt: string;
  updatedAt: string;
};

export type JobSourceEvidence = {
  text: string;
  originalWording: string;
  startOffset?: number;
  endOffset?: number;
  section?: string;
  confidence: number;
};

export type StructuredJobRequirement = {
  id: string;
  type: JobUnderstandingRequirementType;
  importance: JobImportRequirementImportance;
  sourceText: string;
  normalizedConcept?: string;
  canonicalConceptId?: string;
  minimumYears?: number;
  proficiencyLevel?: string;
  requiredValue?: string;
  confidence: number;
  evidence: JobSourceEvidence;
  warnings?: string[];
  userStatus?: "active" | "removed" | "edited" | "added";
};

export type StructuredJobResponsibility = {
  id: string;
  text: string;
  normalizedConcepts: string[];
  confidence: number;
  evidence: JobSourceEvidence;
  userStatus?: "active" | "removed" | "edited" | "added";
};

export type StructuredJobSalary = {
  rawText?: string;
  minimum?: number;
  maximum?: number;
  currency?: string;
  period?: string;
  confidence?: number;
};

export type StructuredJobApplicationDetails = {
  closingDate?: string;
  applicationMethod?: string;
  contactName?: string;
  contactEmail?: string;
  applicationUrl?: string;
  referenceNumber?: string;
  requiredDocuments?: string[];
  requestedQuestions?: string[];
};

export type SemanticJobUnderstanding = {
  id: string;
  userId: string;
  jobImportId: string;
  versionNumber?: number;
  status: JobUnderstandingStatus;
  language: JobIntelligenceLanguage | "unknown";
  title: string;
  organization?: string;
  location?: string;
  employmentType?: string;
  workArrangement?: string;
  seniority?: string;
  industry?: string;
  department?: string;
  summary: string;
  responsibilities: StructuredJobResponsibility[];
  requirements: StructuredJobRequirement[];
  benefits?: string[];
  salary?: StructuredJobSalary;
  applicationDetails: StructuredJobApplicationDetails;
  warnings: string[];
  overallConfidence: number;
  modelVersion?: string;
  promptVersion?: string;
  sourceEvidence: JobSourceEvidence[];
  systemExtraction: Record<string, unknown>;
  userApprovedVersion?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ProfileMatchEvidence = {
  canonicalEntityType: CanonicalEvidenceReference["entityType"];
  canonicalEntityId: string;
  label: string;
  evidenceText: string;
  sourceDocumentIds?: string[];
  confidence: number;
  reviewStatus: CanonicalEvidenceReference["reviewStatus"];
};

export type ProfileRequirementMatch = {
  requirementId: string;
  requirementText: string;
  requirementImportance: JobImportRequirementImportance;
  requirementType: JobUnderstandingRequirementType;
  status: RequirementMatchStatus;
  matchedCanonicalEntityIds: string[];
  evidence: ProfileMatchEvidence[];
  explanation: string;
  userAction?: string;
  confidence: number;
  blocker: boolean;
};

export type ProfileMatchInsight = {
  id: string;
  title: string;
  description: string;
  requirementIds: string[];
  evidenceIds: string[];
  severity?: "info" | "warning" | "high";
};

export type MatchRecommendation = {
  id: string;
  label: string;
  description: string;
  route?: string;
  priority: "high" | "medium" | "low";
};

export type MatchClarificationQuestion = {
  id: string;
  question: string;
  relatedRequirementId: string;
  reason: string;
};

export type ProfileJobMatchAnalysis = {
  id: string;
  userId: string;
  jobUnderstandingId: string;
  jobUnderstandingVersion: number;
  canonicalProfileId: string;
  canonicalProfileVersion: number;
  status: "current" | "stale" | "archived";
  requirements: ProfileRequirementMatch[];
  strengths: ProfileMatchInsight[];
  partialMatches: ProfileMatchInsight[];
  gaps: ProfileMatchInsight[];
  uncertainties: ProfileMatchInsight[];
  blockers: ProfileMatchInsight[];
  fitScore?: number;
  fitBand: ProfileJobFitBand;
  analysisConfidence: number;
  readiness: ProfileJobReadiness;
  scoreExplanation: {
    strongEvidence: string[];
    concerns: string[];
    methodology: string;
  };
  recommendations: MatchRecommendation[];
  clarificationQuestions: MatchClarificationQuestion[];
  targetedCvRoute: string;
  scoringVersion: string;
  createdAt: string;
  updatedAt: string;
  freshness?: {
    currentProfileVersion: number;
    currentJobUnderstandingVersion: number;
    stale: boolean;
    reason?: string;
  };
};

export type TargetedDocumentStrategy = {
  targetRole: string;
  targetOrganization?: string;
  selectedEmploymentIds: string[];
  selectedEducationIds: string[];
  selectedCertificationIds: string[];
  selectedSkillIds: string[];
  selectedProjectIds: string[];
  selectedAchievementIds: string[];
  emphasizedRequirementIds: string[];
  deEmphasizedRequirementIds: string[];
  gapHandling: Array<{
    requirementId: string;
    approach:
      | "address_honestly"
      | "highlight_transferable_evidence"
      | "request_user_confirmation"
      | "exclude_unsupported_claim"
      | "leave_unaddressed";
    explanation: string;
  }>;
  warnings: string[];
};

export type TargetedDocumentDraft = {
  id: string;
  type: TargetedDocumentType;
  professionalDocumentId: string;
  title: string;
  approvalState: TargetedDocumentApprovalState;
  staleState: TargetedDocumentStaleState;
  route?: string;
  warnings: string[];
};

export type TargetedDocumentPackage = {
  id: string;
  userId: string;
  canonicalProfileId: string;
  canonicalProfileVersion: number;
  jobUnderstandingId: string;
  jobUnderstandingVersion: number;
  jobMatchAnalysisId: string;
  scoringVersion: string;
  targetingStrategyVersion: string;
  strategy: TargetedDocumentStrategy;
  documents: TargetedDocumentDraft[];
  unsupportedClaimsBlocked: string[];
  freshness: {
    stale: boolean;
    profileVersionUsed: number;
    jobUnderstandingVersionUsed: number;
    matchAnalysisUpdatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type CreateTargetedDocumentsInput = {
  analysisId: string;
  includeApplicationEmail?: boolean;
  includeLinkedInMessage?: boolean;
  includeRecruiterMessage?: boolean;
};

export type JobUnderstandingInput = {
  jobImport: JobImportRecord;
};

export type JobUnderstandingResult = {
  understanding: SemanticJobUnderstanding;
};

export type JobUnderstandingProvider = {
  understandJob(input: JobUnderstandingInput): Promise<JobUnderstandingResult>;
};

export type JobUnderstandingReviewPatch = {
  title?: string;
  organization?: string;
  location?: string;
  employmentType?: string;
  workArrangement?: string;
  requirements?: StructuredJobRequirement[];
  responsibilities?: StructuredJobResponsibility[];
  applicationDetails?: StructuredJobApplicationDetails;
  confirm?: boolean;
};

export type JobImportUpload = {
  fileName: string;
  fileType: string;
  fileSize: number;
  base64: string;
};

export type CreateJobImportInput =
  | {
      sourceType: "pasted_text";
      rawText: string;
    }
  | {
      sourceType: "manual_entry";
      details: JobImportPreliminaryDetails;
      responsibilities?: string;
      requirements?: string;
      applicationInstructions?: string;
    }
  | {
      sourceType: "uploaded_document";
      upload: JobImportUpload;
    }
  | {
      sourceType: "public_url";
      url: string;
    }
  | {
      sourceType: "existing_opportunity";
      opportunityId: string;
      rawText: string;
      details?: JobImportPreliminaryDetails;
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

