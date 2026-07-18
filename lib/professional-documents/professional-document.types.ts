import type { CanonicalProfessionalIdentity, ProfessionalIdentityView, ViewFreshness } from "@/lib/canonical-profile";
import type { TargetedDocumentApprovalState, TargetedDocumentStaleState, TargetedDocumentStrategy } from "@/lib/job-intelligence/job-intelligence.types";

export type ProfessionalDocumentType = "cv" | "cover_letter" | "professional_bio" | "linkedin_profile" | "application_summary" | "application_email" | "linkedin_message" | "recruiter_message";
export type ProfessionalDocumentStatus = "draft" | "generating" | "ready" | "ready_with_warnings" | "stale" | "archived" | "failed";
export type ProfessionalDocumentLanguage = "en" | "fr";
export type CvPurpose = "master" | "general" | "targeted" | "one_page" | "early_career" | "experienced" | "career_change" | "academic" | "custom";
export type CvPagePreference = "one_page" | "two_pages" | "automatic" | "no_strict_limit";
export type CvSectionType =
  | "header"
  | "professional_summary"
  | "core_skills"
  | "employment"
  | "education"
  | "certifications"
  | "projects"
  | "languages"
  | "awards"
  | "memberships"
  | "volunteering"
  | "references";

export type PresentationSourceType = "canonical" | "user_override" | "generated" | "targeted_generated";
export type PresentationApprovalState = "suggested" | "accepted" | "edited" | "rejected";
export type CvQualityIssueCategory =
  | "missing_information"
  | "content_quality"
  | "consistency"
  | "layout"
  | "readability"
  | "ats_readability"
  | "profile_conflict"
  | "stale_information"
  | "target_relevance";

export type ProfessionalDocumentWarning = {
  id: string;
  category: CvQualityIssueCategory;
  severity: "info" | "warning" | "blocking";
  section: string;
  message: string;
  suggestedAction: string;
  blocksExport: boolean;
};

export type CvViewConfiguration = {
  purpose: CvPurpose;
  language: ProfessionalDocumentLanguage;
  pagePreference: CvPagePreference;
  targetRole?: string;
  targetIndustry?: string;
  targetJobId?: string;
  sections: Array<{
    type: CvSectionType;
    visible: boolean;
    order: number;
    displayStyle?: string;
  }>;
  selectedEntityIds: {
    employment: string[];
    education: string[];
    certifications: string[];
    skills: string[];
    projects: string[];
    languages: string[];
  };
  presentationPreferences: {
    showPhoto: boolean;
    showFullAddress: boolean;
    showReferences: boolean;
    showSkillLevels: boolean;
    showDates: boolean;
    dateFormat: string;
  };
};

export type ProfessionalDocumentConfiguration = CvViewConfiguration | Record<string, unknown>;

export type PresentationField = {
  canonicalEntityId?: string;
  canonicalFieldPath?: string;
  originalCanonicalValue?: string;
  approvedMasterValue?: string;
  presentationValue: string;
  sourceType: PresentationSourceType;
  userApproved: boolean;
  approvalState: PresentationApprovalState;
  generatedForTargetJobId?: string;
  sourceFactIds: string[];
  unsupportedClaimDetected: boolean;
  language: ProfessionalDocumentLanguage;
  createdAt?: string;
  updatedAt?: string;
};

export type CvHeaderContent = {
  fullName: PresentationField;
  targetRole: PresentationField;
  email?: PresentationField;
  phone?: PresentationField;
  city?: PresentationField;
  country?: PresentationField;
  linkedIn?: PresentationField;
  portfolio?: PresentationField;
  github?: PresentationField;
  website?: PresentationField;
};

export type CvSkillContent = {
  id: string;
  name: PresentationField;
  category: string;
  included: boolean;
  selectionReason: string;
};

export type CvEmploymentContent = {
  id: string;
  role: PresentationField;
  employer: PresentationField;
  location?: PresentationField;
  dateRange?: PresentationField;
  bullets: PresentationField[];
  included: boolean;
  selectionReason: string;
};

export type CvEducationContent = {
  id: string;
  qualification: PresentationField;
  institution: PresentationField;
  fieldOfStudy?: PresentationField;
  date?: PresentationField;
  included: boolean;
  selectionReason: string;
};

export type CvCertificationContent = {
  id: string;
  name: PresentationField;
  issuer?: PresentationField;
  date?: PresentationField;
  included: boolean;
  selectionReason: string;
};

export type CvProjectContent = {
  id: string;
  name: PresentationField;
  role?: PresentationField;
  description?: PresentationField;
  impact?: PresentationField;
  included: boolean;
  selectionReason: string;
};

export type CvLanguageContent = {
  id: string;
  language: PresentationField;
  proficiency?: PresentationField;
  included: boolean;
  selectionReason: string;
};

export type CvAdditionalSection = {
  id: string;
  type: CvSectionType;
  title: string;
  fields: PresentationField[];
  included: boolean;
};

export type CvContent = {
  header: CvHeaderContent;
  professionalSummary?: PresentationField;
  skills: CvSkillContent[];
  employment: CvEmploymentContent[];
  education: CvEducationContent[];
  certifications: CvCertificationContent[];
  projects: CvProjectContent[];
  languages: CvLanguageContent[];
  additionalSections: CvAdditionalSection[];
};

export type ProfessionalDocumentContent = CvContent | Record<string, unknown>;

export type ProfessionalDocument = {
  id: string;
  userId: string;
  canonicalProfileId: string;
  profileVersion: number;
  type: ProfessionalDocumentType;
  status: ProfessionalDocumentStatus;
  name: string;
  language: ProfessionalDocumentLanguage;
  target?: {
    targetRole?: string;
    targetIndustry?: string;
    targetJobId?: string;
    jobDescriptionHash?: string;
  };
  targeting?: {
    packageId?: string;
    jobUnderstandingId?: string;
    jobUnderstandingVersion?: number;
    jobMatchAnalysisId?: string;
    canonicalProfileVersion?: number;
    selectedEntityIds?: Record<string, string[]>;
    excludedEntityIds?: Record<string, string[]>;
    templateVersion?: string;
    contentVersion?: string;
    targetingStrategyVersion?: string;
    strategy?: TargetedDocumentStrategy;
    approvalState?: TargetedDocumentApprovalState;
    staleState?: TargetedDocumentStaleState;
    approvedAt?: string;
  };
  configuration: ProfessionalDocumentConfiguration;
  selectedEntities: {
    employmentIds: string[];
    educationIds: string[];
    certificationIds: string[];
    skillIds: string[];
    languageIds: string[];
    projectIds: string[];
    achievementIds: string[];
  };
  content: ProfessionalDocumentContent;
  template: {
    templateId: string;
    templateVersion: string;
    layoutVariant?: string;
  };
  generation: {
    contentEngineVersion: string;
    renderingEngineVersion: string;
    generatedAt?: string;
    regeneratedAt?: string;
  };
  freshness: ViewFreshness;
  warnings: ProfessionalDocumentWarning[];
  createdAt: string;
  updatedAt: string;
};

export type CvContentSelectionItem = {
  entityType: CvSectionType;
  entityId: string;
  included: boolean;
  reason: string;
  priority: number;
};

export type CvContentSelectionResult = {
  selected: CvContentSelectionItem[];
  excluded: CvContentSelectionItem[];
  warnings: ProfessionalDocumentWarning[];
};

export type ProfessionalSummaryInput = {
  profile: CanonicalProfessionalIdentity;
  configuration: CvViewConfiguration;
};

export type ProfessionalSummaryResult = {
  field: PresentationField;
  validation: {
    grounded: boolean;
    unsupportedClaims: string[];
  };
};

export type ExperienceBulletInput = {
  canonicalEntityId: string;
  sourceText: string;
  targetRole?: string;
  language: ProfessionalDocumentLanguage;
  sourceFactIds: string[];
};

export type ExperienceBulletResult = {
  field: PresentationField;
  unsupportedClaimDetected: boolean;
};

export type CvTailoringInput = {
  profile: CanonicalProfessionalIdentity;
  configuration: CvViewConfiguration;
  targetJobText?: string;
};

export type CvTailoringResult = {
  content: CvContent;
  warnings: ProfessionalDocumentWarning[];
};

export type CoverLetterInput = {
  profile: CanonicalProfessionalIdentity;
  targetRole: string;
  companyName?: string;
  jobDescription?: string;
  language: ProfessionalDocumentLanguage;
};

export type CoverLetterResult = {
  content: Record<string, PresentationField>;
  warnings: ProfessionalDocumentWarning[];
};

export type ProfessionalDocumentWriter = {
  generateProfessionalSummary(input: ProfessionalSummaryInput): Promise<ProfessionalSummaryResult>;
  improveExperienceBullet(input: ExperienceBulletInput): Promise<ExperienceBulletResult>;
  tailorCvContent(input: CvTailoringInput): Promise<CvTailoringResult>;
  generateCoverLetter(input: CoverLetterInput): Promise<CoverLetterResult>;
};

export type ProfessionalDocumentTemplateDefinition = {
  id: string;
  name: string;
  version: string;
  category: "professional" | "executive" | "modern" | "minimal" | "early_career" | "creative_professional";
  supportedLanguages: ProfessionalDocumentLanguage[];
  layout: "single_column" | "two_column" | "sidebar";
  supportedSections: CvSectionType[];
  renderer: string;
  printStyles: string;
};

export type ProfessionalDocumentReadModel = {
  profile: CanonicalProfessionalIdentity;
  view: ProfessionalIdentityView;
  document: ProfessionalDocument;
};
