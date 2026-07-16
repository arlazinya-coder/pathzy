import type { SemanticDate, SemanticDocumentModel, SemanticEntityType } from "@/lib/documents/semantic";

export type ReasoningCaseType =
  | "possible_same_employment"
  | "possible_same_education"
  | "possible_same_certification"
  | "possible_same_project"
  | "possible_same_organisation"
  | "possible_same_skill"
  | "possible_duplicate"
  | "possible_promotion"
  | "possible_role_change"
  | "possible_employer_rename"
  | "possible_title_variant"
  | "possible_date_refinement"
  | "possible_source_confirmation"
  | "possible_conflict"
  | "possible_profile_update"
  | "possible_missing_record"
  | "timeline_overlap"
  | "timeline_gap"
  | "unsupported_claim"
  | "insufficient_evidence"
  | "unknown";

export type ReasoningConclusion =
  | "same_entity"
  | "likely_same_entity"
  | "possibly_same_entity"
  | "different_entities"
  | "possible_promotion"
  | "possible_role_change"
  | "one_source_refines_another"
  | "one_source_confirms_another"
  | "sources_conflict"
  | "insufficient_evidence"
  | "requires_user_confirmation"
  | "unknown";

export type ReasoningStatus = "pending" | "processing" | "resolved" | "needs_user_input" | "dismissed" | "failed" | "stale";
export type ReasoningRecommendation = "auto_accept_safe_metadata" | "suggest_merge" | "suggest_keep_separate" | "ask_user" | "manual_review" | "ignore" | "insufficient_evidence";
export type ReasoningEntityType = "employment" | "education" | "certification" | "project" | "organisation" | "skill" | "profile_field";
export type EvidenceSourceType = "user_confirmed_profile" | "official_employment_document" | "reference_letter" | "academic_transcript" | "certificate" | "cv" | "linkedin" | "cover_letter" | "portfolio" | "manual_entry" | "unknown";
export type ReasoningSignalDirection = "supports" | "contradicts" | "neutral";
export type ReasoningSignalType =
  | "exact_text_match"
  | "normalized_text_match"
  | "semantic_title_similarity"
  | "same_normalized_organisation"
  | "same_location"
  | "same_start_date"
  | "same_end_date"
  | "overlapping_date_range"
  | "adjacent_date_range"
  | "responsibility_similarity"
  | "achievement_similarity"
  | "skill_overlap"
  | "same_department"
  | "same_industry"
  | "same_document_section"
  | "independent_source_confirmation"
  | "reference_letter_confirmation"
  | "certificate_confirmation"
  | "profile_match"
  | "source_reliability"
  | "source_recency"
  | "explicit_statement"
  | "contradictory_employer"
  | "contradictory_dates"
  | "contradictory_location"
  | "contradictory_seniority"
  | "simultaneous_full_time_roles"
  | "insufficient_context";

export type ReasoningQuestionType =
  | "same_employment"
  | "official_job_title"
  | "promotion_or_title_change"
  | "correct_employer_name"
  | "correct_date_range"
  | "same_qualification"
  | "same_certification"
  | "conflicting_information"
  | "missing_context";

export type SkillRelationship = "same_skill" | "alias" | "related_skill" | "broader_skill" | "narrower_skill" | "different_skill";
export type DateComparisonRelation = "exact" | "compatible" | "overlapping" | "adjacent" | "conflicting" | "unknown";
export type ReasoningBlockingKeyType = "organisation" | "date_window" | "role_family" | "institution" | "qualification" | "issuer" | "credential_id" | "location" | "skill";

export type ReasoningBlockingKey = { type: ReasoningBlockingKeyType; value: string };
export type DateComparisonResult = { relation: DateComparisonRelation; overlapRatio?: number; confidence: number; explanation: string };

export type ReasoningSignal = {
  type: ReasoningSignalType;
  score: number;
  direction: ReasoningSignalDirection;
  description: string;
  sourceEntityIds: string[];
  sourceDocumentIds: string[];
  confidence: number;
};

export type ReasoningEvidence = {
  id: string;
  direction: "supporting" | "contradicting";
  claim: string;
  weight: number;
  confidence: number;
  source: {
    documentId?: string;
    semanticReadingId?: string;
    entityIds: string[];
    regionIds: string[];
    pageNumbers: number[];
    sourceType: EvidenceSourceType;
  };
};

export type ReasoningAssumption = { id: string; description: string; confidence: number; requiresUserConfirmation: boolean };
export type ReasoningQuestion = { id: string; type: ReasoningQuestionType; prompt: string; options?: Array<{ value: string; label: string }>; allowCustomAnswer: boolean; relatedEntityIds: string[] };
export type ReasoningProposedAction = { id: string; type: "merge_entities" | "keep_separate" | "mark_promotion" | "mark_title_change" | "update_profile_field" | "dismiss"; label: string; reversible: true; requiresUserConfirmation: boolean };

export type ReasoningDecision = {
  id: string;
  caseId: string;
  conclusion: ReasoningConclusion;
  confidence: number;
  recommendation: ReasoningRecommendation;
  explanation: string;
  supportingEvidence: ReasoningEvidence[];
  contradictingEvidence: ReasoningEvidence[];
  assumptions: ReasoningAssumption[];
  unresolvedQuestions: ReasoningQuestion[];
  proposedActions: ReasoningProposedAction[];
  requiresUserConfirmation: boolean;
  reversible: true;
};

export type ReasoningCandidateGroup = {
  id: string;
  entityType: ReasoningEntityType;
  candidateEntityIds: string[];
  blockingSignals: ReasoningSignal[];
  matchingSignals: ReasoningSignal[];
  conflictingSignals: ReasoningSignal[];
  preliminaryScore: number;
};

export type ReasoningCasePriority = { score: number; impact: "high" | "medium" | "low"; reason: string };
export type ReasoningConflict = { id: string; type: "value_conflict" | "date_conflict" | "organisation_conflict" | "title_conflict" | "qualification_conflict" | "status_conflict" | "timeline_conflict"; entityIds: string[]; explanation: string; severity: "low" | "medium" | "high"; confidence: number; requiresUserDecision: boolean };

export type CareerEvidenceRecord = {
  id: string;
  userId: string;
  entityType: ReasoningEntityType;
  semanticReadingId: string;
  documentId: string;
  sourceType: EvidenceSourceType;
  semanticEntityType?: SemanticEntityType;
  title?: string;
  organisation?: string;
  institution?: string;
  qualification?: string;
  issuer?: string;
  credentialId?: string;
  location?: string;
  startDate?: SemanticDate;
  endDate?: SemanticDate;
  responsibilities: string[];
  achievements: string[];
  skills: string[];
  confidence: number;
  entityIds: string[];
  regionIds: string[];
  pageNumbers: number[];
  original: unknown;
};

export type ReasoningCase = {
  id: string;
  userId: string;
  type: ReasoningCaseType;
  status: ReasoningStatus;
  subjectEntityIds: string[];
  sourceDocumentIds: string[];
  semanticReadingIds: string[];
  candidateGroups: ReasoningCandidateGroup[];
  decision?: ReasoningDecision;
  confidence: number;
  priority: ReasoningCasePriority;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
};

export type CareerReasoningInput = {
  userId: string;
  semanticModels: SemanticDocumentModel[];
  existingProfile?: Record<string, unknown> | null;
  language?: "english" | "french";
};

export type CareerReasoningProviderResult = { decision: ReasoningDecision };
export type CareerReasoningProvider = { reason(input: { case: ReasoningCase; records: CareerEvidenceRecord[]; signals: ReasoningSignal[] }): Promise<CareerReasoningProviderResult> };
export type ReasoningRunSummary = { cases: ReasoningCase[]; matches: number; conflicts: number; questions: number; confirmed: number; stale: number; confidence: number };
export type ApplyReasoningDecisionCommand = { caseId: string; userDecision: string; selectedCanonicalValues?: unknown };
