import type { DocumentInspectionResult } from "@/lib/documents/inspection";
import type { VisualDocumentModel } from "@/lib/documents/visual";

export type SemanticStatus = "pending" | "processing" | "completed" | "completed_with_warnings" | "manual_review_required" | "failed";
export type SemanticExplicitness = "explicit" | "strongly_implied" | "weakly_implied";
export type ReviewStatus = "unreviewed" | "accepted" | "edited" | "rejected";
export type SemanticEntityType =
  | "person_name" | "professional_headline" | "profession" | "career_field" | "email" | "phone_number" | "location" | "city" | "country"
  | "postal_address" | "website" | "linkedin_url" | "github_url" | "portfolio_url" | "professional_summary" | "employment_entry" | "job_title"
  | "employer" | "employment_type" | "employment_start_date" | "employment_end_date" | "current_employment" | "employment_location"
  | "responsibility" | "achievement" | "education_entry" | "qualification" | "degree_level" | "field_of_study" | "education_institution"
  | "education_start_date" | "education_end_date" | "education_status" | "education_result" | "certification_entry" | "certification_name"
  | "certification_issuer" | "certification_date" | "certification_expiry_date" | "licence_number" | "skill" | "technical_skill" | "soft_skill"
  | "tool" | "technology" | "language" | "language_proficiency" | "project_entry" | "project_name" | "project_role" | "project_date"
  | "project_description" | "award" | "membership" | "publication" | "volunteer_entry" | "reference_entry" | "referee_name" | "referee_role"
  | "referee_organisation" | "referee_contact" | "date" | "date_range" | "organisation" | "section_title" | "unknown";
export type SemanticCategory =
  | "identity" | "contact" | "professional_profile" | "employment" | "education" | "certification" | "skills" | "languages"
  | "projects" | "awards" | "memberships" | "publications" | "volunteering" | "references" | "metadata" | "unknown";
export type SemanticRelationshipType =
  | "belongs_to_employment_entry" | "belongs_to_education_entry" | "belongs_to_certification_entry" | "belongs_to_project_entry"
  | "belongs_to_reference_entry" | "title_at_organisation" | "qualification_from_institution" | "date_for_entity"
  | "location_for_entity" | "description_for_entity" | "achievement_for_employment" | "responsibility_for_employment"
  | "proficiency_for_language" | "issuer_of_certification" | "field_of_study_for_qualification" | "contact_method_for_person"
  | "same_entity" | "possible_duplicate" | "continues_on_next_page" | "unknown";
export type SkillCategory = "technical" | "software" | "tool" | "platform" | "programming_language" | "framework" | "laboratory" | "business" | "management" | "communication" | "leadership" | "interpersonal" | "language" | "industry" | "unknown";
export type SemanticWarningCode =
  | "ambiguous_entity_type" | "job_title_employer_uncertain" | "ambiguous_date" | "qualification_normalization_uncertain"
  | "section_mapping_uncertain" | "implied_skill_detected" | "possible_duplicate" | "profile_conflict" | "missing_source_evidence"
  | "low_semantic_confidence" | "table_interpretation_uncertain" | "cross_page_merge_uncertain" | "unsupported_language"
  | "provider_response_repaired" | "manual_review_required" | "semantic_processing_failed";
export type SemanticConflictType = "different_value" | "date_conflict" | "duplicate_entry" | "missing_existing_value" | "new_document_value" | "ambiguous_mapping";

export type SemanticSource = {
  pageNumber: number;
  regionIds: string[];
  sectionId?: string;
  timelineEntryId?: string;
  tableId?: string;
  tableCellIds?: string[];
  visualRelationshipIds?: string[];
};
export type SemanticEvidence = { kind: "text" | "section" | "layout" | "icon" | "timeline" | "table" | "proximity" | "repeated_pattern" | "document_type"; description: string; confidence: number };
export type SemanticEntity = {
  id: string;
  type: SemanticEntityType;
  category: SemanticCategory;
  originalText: string;
  normalizedValue?: string;
  structuredValue?: unknown;
  confidence: number;
  explicitness: SemanticExplicitness;
  source: SemanticSource;
  evidence: SemanticEvidence[];
  alternatives?: Array<{ type: SemanticEntityType; confidence: number }>;
  requiresReview: boolean;
  reviewStatus: ReviewStatus;
};
export type SemanticRelationship = { id: string; type: SemanticRelationshipType; sourceEntityId: string; targetEntityId: string; confidence: number; evidenceRegionIds: string[] };
export type SemanticValue<T> = { value: T; originalText: string; normalizedValue?: T; confidence: number; sourceRegionIds: string[]; explicitness: SemanticExplicitness; requiresReview: boolean; reviewStatus: ReviewStatus };
export type SemanticDate = SemanticValue<string> & { normalized?: { year?: number; month?: number; day?: number; current?: boolean; approximate?: boolean; expected?: boolean } };
export type SemanticLocation = { originalText: string; city?: SemanticValue<string>; country?: SemanticValue<string>; sourceRegionIds: string[]; confidence: number; requiresReview: boolean };
export type SemanticIdentity = { fullName?: SemanticValue<string>; sourceRegionIds: string[]; confidence: number; requiresReview: boolean };
export type SemanticContactInformation = { emails: SemanticValue<string>[]; phones: SemanticValue<string>[]; locations: SemanticLocation[]; websites: SemanticValue<string>[]; linkedIn?: SemanticValue<string>; github?: SemanticValue<string>; portfolio?: SemanticValue<string>; confidence: number; requiresReview: boolean };
export type SemanticProfessionalProfile = { headline?: SemanticValue<string>; profession?: SemanticValue<string>; careerField?: SemanticValue<string>; summary?: SemanticValue<string>; confidence: number; requiresReview: boolean };
export type SemanticEmploymentEntry = { id: string; jobTitle?: SemanticValue<string>; employer?: SemanticValue<string>; location?: SemanticLocation; employmentType?: SemanticValue<string>; startDate?: SemanticDate; endDate?: SemanticDate; isCurrent?: SemanticValue<boolean>; responsibilities: SemanticValue<string>[]; achievements: SemanticValue<string>[]; tools: SemanticValue<string>[]; technologies: SemanticValue<string>[]; skills: SemanticValue<string>[]; sourceRegionIds: string[]; confidence: number; requiresReview: boolean };
export type SemanticEducationEntry = { id: string; qualification?: SemanticValue<string>; degreeLevel?: SemanticValue<string>; fieldOfStudy?: SemanticValue<string>; institution?: SemanticValue<string>; startDate?: SemanticDate; endDate?: SemanticDate; graduationDate?: SemanticDate; status?: SemanticValue<"completed" | "in_progress" | "incomplete" | "unknown">; result?: SemanticValue<string>; location?: SemanticLocation; sourceRegionIds: string[]; confidence: number; requiresReview: boolean };
export type SemanticCertificationEntry = { id: string; name?: SemanticValue<string>; issuer?: SemanticValue<string>; issueDate?: SemanticDate; expiryDate?: SemanticDate; credentialId?: SemanticValue<string>; credentialUrl?: SemanticValue<string>; sourceRegionIds: string[]; confidence: number; requiresReview: boolean };
export type SemanticSkill = { id: string; name: string; normalizedName?: string; category: SkillCategory; proficiency?: string; yearsOfExperience?: number; sourceRegionIds: string[]; confidence: number; explicitness: SemanticExplicitness; requiresReview: boolean; reviewStatus: ReviewStatus };
export type SemanticLanguage = { id: string; language: string; proficiency?: string; normalizedProficiency?: "native" | "fluent" | "advanced" | "intermediate" | "basic" | "unknown"; sourceRegionIds: string[]; confidence: number; reviewStatus: ReviewStatus };
export type SemanticProject = { id: string; name?: SemanticValue<string>; role?: SemanticValue<string>; date?: SemanticDate; description?: SemanticValue<string>; sourceRegionIds: string[]; confidence: number; requiresReview: boolean };
export type SemanticAward = SemanticValue<string>;
export type SemanticMembership = SemanticValue<string>;
export type SemanticPublication = SemanticValue<string>;
export type SemanticVolunteerEntry = SemanticValue<string>;
export type SemanticReference = { id: string; name?: SemanticValue<string>; role?: SemanticValue<string>; organisation?: SemanticValue<string>; contact?: SemanticValue<string>; sourceRegionIds: string[]; confidence: number; requiresReview: boolean };
export type SemanticUnclassifiedContent = { originalText: string; source: SemanticSource; reason: string; confidence: number; reviewStatus: ReviewStatus };
export type SemanticWarning = { code: SemanticWarningCode; severity: "info" | "warning" | "error"; message: string; entityIds?: string[]; regionIds?: string[]; pageNumber?: number; confidence?: number; suggestedAction?: string };
export type SemanticConflict = { id: string; type: SemanticConflictType; field: string; documentValue?: string; profileValue?: string; entityIds: string[]; confidence: number; requiresReview: boolean };
export type SemanticDocumentModel = {
  id: string;
  documentId: string;
  inspectionId: string;
  visualReadingId: string;
  userId: string;
  status: SemanticStatus;
  documentType: string;
  primaryLanguage?: string;
  identity?: SemanticIdentity;
  contact?: SemanticContactInformation;
  professionalProfile?: SemanticProfessionalProfile;
  employment: SemanticEmploymentEntry[];
  education: SemanticEducationEntry[];
  certifications: SemanticCertificationEntry[];
  skills: SemanticSkill[];
  languages: SemanticLanguage[];
  projects: SemanticProject[];
  awards: SemanticAward[];
  memberships: SemanticMembership[];
  publications: SemanticPublication[];
  volunteering: SemanticVolunteerEntry[];
  references: SemanticReference[];
  entities: SemanticEntity[];
  relationships: SemanticRelationship[];
  unclassifiedContent: SemanticUnclassifiedContent[];
  conflicts: SemanticConflict[];
  warnings: SemanticWarning[];
  confidence: { identity: number; contact: number; professionalProfile: number; employment: number; education: number; certifications: number; skills: number; languages: number; overall: number };
  provider?: { model?: string; version?: string; taxonomyVersion?: string; deterministicOnly?: boolean };
  createdAt: string;
  completedAt?: string;
};
export type SemanticUnderstandingInput = { documentId: string; userId: string; inspection: DocumentInspectionResult; visualReading: VisualDocumentModel; existingProfile?: Record<string, unknown> | null };
export type SemanticModelDecision = { useModel: boolean; reason: string; entityIds: string[] };
