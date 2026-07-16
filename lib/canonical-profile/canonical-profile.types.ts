export type CanonicalProfileStatus = "draft" | "active" | "needs_review" | "archived";
export type CanonicalReviewStatus = "confirmed" | "user_entered" | "provisionally_accepted" | "needs_review" | "disputed" | "archived";
export type CanonicalSourceType = "uploaded_document" | "semantic_entity" | "reasoning_case" | "user_entry" | "user_correction" | "import" | "existing_profile";
export type CanonicalVisibility = "private" | "profile" | "exportable" | "public";
export type CanonicalReadiness = "not_ready" | "review_required" | "ready" | "ready_with_warnings";
export type CanonicalEntityType =
  | "identity"
  | "contact"
  | "professional_profile"
  | "employment"
  | "education"
  | "certification"
  | "licence"
  | "skill"
  | "language"
  | "project"
  | "achievement"
  | "award"
  | "membership"
  | "publication"
  | "volunteering"
  | "reference"
  | "career_preference"
  | "timeline_event";

export type CanonicalDate = {
  raw?: string;
  year?: number;
  month?: number;
  day?: number;
  current?: boolean;
  approximate?: boolean;
  expected?: boolean;
};

export type CanonicalDateRange = {
  start?: CanonicalDate;
  end?: CanonicalDate;
};

export type CanonicalSourceReference = {
  sourceType: CanonicalSourceType;
  documentId?: string;
  semanticEntityId?: string;
  reasoningCaseId?: string;
  sourceRegionIds?: string[];
  pageNumbers?: number[];
  originalValue?: string;
  sourceConfidence?: number;
  addedAt: string;
};

export type CanonicalValue<T> = {
  value: T;
  displayValue?: string;
  status: CanonicalReviewStatus;
  confidence: number;
  sourceReferences: CanonicalSourceReference[];
  selectedSourceId?: string;
  reasoningCaseId?: string;
  userDecisionId?: string;
  visibility?: CanonicalVisibility;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
};

export type CanonicalIdentity = {
  preferredName?: CanonicalValue<string>;
  fullName?: CanonicalValue<string>;
  professionalHeadline?: CanonicalValue<string>;
  currentProfession?: CanonicalValue<string>;
  careerField?: CanonicalValue<string>;
  location?: CanonicalValue<string>;
  photoDocumentId?: CanonicalValue<string>;
  professionalStatus?: CanonicalValue<string>;
};

export type CanonicalContact = {
  primaryEmail?: CanonicalValue<string>;
  secondaryEmail?: CanonicalValue<string>;
  primaryPhone?: CanonicalValue<string>;
  secondaryPhone?: CanonicalValue<string>;
  city?: CanonicalValue<string>;
  country?: CanonicalValue<string>;
  professionalWebsite?: CanonicalValue<string>;
  linkedIn?: CanonicalValue<string>;
  github?: CanonicalValue<string>;
  portfolio?: CanonicalValue<string>;
  otherLinks: Array<CanonicalValue<string>>;
};

export type CanonicalProfessionalProfile = {
  headline?: CanonicalValue<string>;
  profession?: CanonicalValue<string>;
  careerField?: CanonicalValue<string>;
  seniority?: CanonicalValue<string>;
  yearsOfExperience?: CanonicalValue<number>;
  professionalSummary?: CanonicalValue<string>;
  valueProposition?: CanonicalValue<string>;
  targetRoles: Array<CanonicalValue<string>>;
  industries: Array<CanonicalValue<string>>;
  workPreferences: Array<CanonicalValue<string>>;
};

export type CanonicalEntityLink = {
  entityType: CanonicalEntityType;
  entityId: string;
  relationship?: string;
};

export type CanonicalResponsibility = {
  id: string;
  statement: CanonicalValue<string>;
  sourceReferences: CanonicalSourceReference[];
};

export type CanonicalAchievement = {
  id: string;
  statement: CanonicalValue<string>;
  impact?: CanonicalValue<string>;
  sourceReferences: CanonicalSourceReference[];
  confidence: number;
  status: CanonicalReviewStatus;
};

export type CanonicalEmployment = {
  id: string;
  canonicalTitle: CanonicalValue<string>;
  titleVariants: Array<CanonicalValue<string>>;
  employer: CanonicalValue<string>;
  employerAliases: Array<CanonicalValue<string>>;
  location?: CanonicalValue<string>;
  employmentType?: CanonicalValue<string>;
  department?: CanonicalValue<string>;
  startDate?: CanonicalValue<CanonicalDate>;
  endDate?: CanonicalValue<CanonicalDate>;
  isCurrent: CanonicalValue<boolean>;
  responsibilities: CanonicalResponsibility[];
  achievements: CanonicalAchievement[];
  skills: CanonicalEntityLink[];
  tools: CanonicalEntityLink[];
  technologies: CanonicalEntityLink[];
  projects: CanonicalEntityLink[];
  progression?: {
    previousEmploymentId?: string;
    nextEmploymentId?: string;
    relationship: "promotion" | "title_change" | "department_change" | "continuation" | "unknown";
  };
  status: "confirmed" | "needs_review" | "disputed" | "archived";
  sourceReferences: CanonicalSourceReference[];
  confidence: number;
  createdAt: string;
  updatedAt: string;
};

export type CanonicalEducation = {
  id: string;
  qualification: CanonicalValue<string>;
  normalizedQualification?: CanonicalValue<string>;
  degreeLevel?: CanonicalValue<string>;
  fieldOfStudy?: CanonicalValue<string>;
  institution: CanonicalValue<string>;
  institutionAliases: Array<CanonicalValue<string>>;
  startDate?: CanonicalValue<CanonicalDate>;
  endDate?: CanonicalValue<CanonicalDate>;
  graduationDate?: CanonicalValue<CanonicalDate>;
  status: CanonicalValue<"completed" | "in_progress" | "incomplete" | "unknown">;
  result?: CanonicalValue<string>;
  location?: CanonicalValue<string>;
  supportingDocumentIds: string[];
  sourceReferences: CanonicalSourceReference[];
  confidence: number;
  reviewStatus: "confirmed" | "needs_review" | "disputed" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type CanonicalCertification = {
  id: string;
  canonicalName: CanonicalValue<string>;
  titleVariants: Array<CanonicalValue<string>>;
  issuer?: CanonicalValue<string>;
  issueDate?: CanonicalValue<CanonicalDate>;
  expiryDate?: CanonicalValue<CanonicalDate>;
  credentialId?: CanonicalValue<string>;
  credentialUrl?: CanonicalValue<string>;
  activeStatus?: CanonicalValue<"active" | "expired" | "unknown">;
  supportingDocumentIds: string[];
  sourceReferences: CanonicalSourceReference[];
  confidence: number;
  status: "confirmed" | "needs_review" | "disputed" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type CanonicalLicence = CanonicalCertification & {
  licenceNumber?: CanonicalValue<string>;
  jurisdiction?: CanonicalValue<string>;
};

export type CanonicalSkillCategory =
  | "technical"
  | "software"
  | "tool"
  | "platform"
  | "programming_language"
  | "framework"
  | "laboratory"
  | "business"
  | "management"
  | "communication"
  | "leadership"
  | "interpersonal"
  | "industry"
  | "unknown";

export type CanonicalSkill = {
  id: string;
  canonicalName: CanonicalValue<string>;
  aliases: Array<CanonicalValue<string>>;
  category: CanonicalSkillCategory;
  explicitness: "explicit" | "confirmed_implied" | "unconfirmed_implied";
  proficiency?: CanonicalValue<string>;
  yearsOfExperience?: CanonicalValue<number>;
  lastUsedDate?: CanonicalValue<CanonicalDate>;
  relatedEmploymentIds: string[];
  relatedEducationIds: string[];
  relatedCertificationIds: string[];
  relatedProjectIds: string[];
  sourceReferences: CanonicalSourceReference[];
  confidence: number;
  status: "confirmed" | "needs_review" | "archived";
};

export type CanonicalLanguage = {
  id: string;
  language: CanonicalValue<string>;
  proficiency?: CanonicalValue<string>;
  normalizedProficiency?: CanonicalValue<"native" | "fluent" | "advanced" | "intermediate" | "basic" | "unknown">;
  sourceReferences: CanonicalSourceReference[];
  confidence: number;
  status: "confirmed" | "needs_review" | "archived";
};

export type CanonicalProject = {
  id: string;
  name?: CanonicalValue<string>;
  role?: CanonicalValue<string>;
  tools: CanonicalEntityLink[];
  description?: CanonicalValue<string>;
  impact?: CanonicalValue<string>;
  date?: CanonicalValue<CanonicalDate>;
  sourceReferences: CanonicalSourceReference[];
  confidence: number;
  status: "confirmed" | "needs_review" | "archived";
};

export type CanonicalAward = CanonicalAchievement;
export type CanonicalMembership = { id: string; name: CanonicalValue<string>; organisation?: CanonicalValue<string>; sourceReferences: CanonicalSourceReference[]; confidence: number; status: "confirmed" | "needs_review" | "archived" };
export type CanonicalPublication = { id: string; title: CanonicalValue<string>; publisher?: CanonicalValue<string>; date?: CanonicalValue<CanonicalDate>; url?: CanonicalValue<string>; sourceReferences: CanonicalSourceReference[]; confidence: number; status: "confirmed" | "needs_review" | "archived" };
export type CanonicalVolunteerExperience = { id: string; role?: CanonicalValue<string>; organisation?: CanonicalValue<string>; description?: CanonicalValue<string>; dateRange?: CanonicalValue<CanonicalDateRange>; sourceReferences: CanonicalSourceReference[]; confidence: number; status: "confirmed" | "needs_review" | "archived" };
export type CanonicalReference = { id: string; name?: CanonicalValue<string>; role?: CanonicalValue<string>; organisation?: CanonicalValue<string>; contact?: CanonicalValue<string>; permissionStatus?: CanonicalValue<"not_requested" | "requested" | "approved" | "declined">; sourceReferences: CanonicalSourceReference[]; confidence: number; status: "confirmed" | "needs_review" | "archived" };

export type CanonicalCareerPreferences = {
  targetRoles: Array<CanonicalValue<string>>;
  targetIndustries: Array<CanonicalValue<string>>;
  preferredLocations: Array<CanonicalValue<string>>;
  remotePreference?: CanonicalValue<string>;
  salaryGoal?: CanonicalValue<string>;
  workStyle?: CanonicalValue<string>;
};

export type CanonicalTimelineEvent = {
  id: string;
  type:
    | "employment_started"
    | "employment_ended"
    | "promotion"
    | "title_change"
    | "education_started"
    | "education_completed"
    | "certification_earned"
    | "certification_expired"
    | "project_completed"
    | "award_received"
    | "volunteering_started"
    | "volunteering_ended"
    | "career_gap"
    | "other";
  date?: CanonicalDate;
  dateRange?: CanonicalDateRange;
  relatedEntityType: CanonicalEntityType;
  relatedEntityId: string;
  title: string;
  description?: string;
  confidence: number;
  status: "confirmed" | "needs_review";
  sourceReferences: CanonicalSourceReference[];
};

export type ProfileCompletion = {
  percentage: number;
  missingSections: string[];
  reviewNeededCount: number;
};

export type CanonicalProfileConfidence = {
  overall: number;
  identity: number;
  contact: number;
  employment: number;
  education: number;
  skills: number;
  consistency: number;
};

export type CanonicalProfileQuality = {
  completeness: number;
  confidence: number;
  consistency: number;
  readiness: CanonicalReadiness;
};

export type CanonicalProfileIssue = {
  id: string;
  severity: "info" | "warning" | "blocking";
  fieldPath: string;
  messageKey: string;
  sourceReferences: CanonicalSourceReference[];
};

export type CanonicalProfessionalIdentity = {
  id: string;
  userId: string;
  version: number;
  status: CanonicalProfileStatus;
  identity: CanonicalIdentity;
  contact: CanonicalContact;
  professionalProfile: CanonicalProfessionalProfile;
  employment: CanonicalEmployment[];
  education: CanonicalEducation[];
  certifications: CanonicalCertification[];
  licences: CanonicalLicence[];
  skills: CanonicalSkill[];
  languages: CanonicalLanguage[];
  projects: CanonicalProject[];
  achievements: CanonicalAchievement[];
  awards: CanonicalAward[];
  memberships: CanonicalMembership[];
  publications: CanonicalPublication[];
  volunteering: CanonicalVolunteerExperience[];
  references: CanonicalReference[];
  careerPreferences?: CanonicalCareerPreferences;
  careerTimeline: CanonicalTimelineEvent[];
  completion: ProfileCompletion;
  confidence: CanonicalProfileConfidence;
  unresolvedIssues: CanonicalProfileIssue[];
  createdAt: string;
  updatedAt: string;
  lastConfirmedAt?: string;
};

export type ProfessionalIdentityViewType =
  | "master_profile"
  | "cv"
  | "cover_letter"
  | "linkedin"
  | "professional_bio"
  | "job_application"
  | "portfolio"
  | "career_timeline"
  | "skills_profile"
  | "interview_profile";

export type ViewFieldOverride = {
  canonicalEntityId: string;
  fieldPath: string;
  overrideType: "hide" | "reorder" | "presentation_text" | "shortened_text" | "targeted_text";
  value?: unknown;
};

export type ProfessionalIdentityView = {
  id: string;
  userId: string;
  canonicalProfileId: string;
  type: ProfessionalIdentityViewType;
  name?: string;
  configuration: {
    selectedEmploymentIds?: string[];
    selectedEducationIds?: string[];
    selectedSkillIds?: string[];
    selectedCertificationIds?: string[];
    hiddenEntityIds?: string[];
    fieldOverrides?: ViewFieldOverride[];
    language?: "en" | "fr";
    targetRole?: string;
    targetJobId?: string;
    tone?: string;
    length?: string;
  };
  generatedContent?: unknown;
  profileVersion: number;
  createdAt: string;
  updatedAt: string;
};

export type ViewFreshness = {
  profileVersionUsed: number;
  currentProfileVersion: number;
  status: "current" | "stale" | "partially_stale";
  changedEntityIds: string[];
};

export type CanonicalProfileVersion = {
  id: string;
  profileId: string;
  versionNumber: number;
  changeType: "field_added" | "field_updated" | "entity_merged" | "entity_split" | "entity_archived" | "reasoning_applied" | "user_correction" | "import_confirmed" | "rollback";
  changedBy: "user" | "system" | "reasoning_confirmation" | "migration";
  changeSummary: string;
  snapshotJson?: unknown;
  changeSetJson: unknown;
  reasoningCaseId?: string;
  userDecisionId?: string;
  createdAt: string;
};

export type CanonicalProfileSummary = {
  profileId: string;
  userId: string;
  version: number;
  status: CanonicalProfileStatus;
  completion: number;
  confidence: number;
  consistency: number;
  readiness: CanonicalReadiness;
  reviewNeededCount: number;
  currentProfession?: string;
  currentEmployment?: string;
  topSkills: string[];
  latestTimelineItems: CanonicalTimelineEvent[];
  updatedAt: string;
};

