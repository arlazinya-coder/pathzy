export const diagnosisQuestionCategories = [
  "EMPLOYMENT_SITUATION",
  "JOB_SEARCH_ACTIVITY",
  "APPLICATION_QUALITY",
  "INTERVIEW_HISTORY",
  "IMMEDIATE_INCOME_NEED",
  "PRACTICAL_ACCESS",
  "DIGITAL_ACCESS",
  "COMMUNICATION_AND_LITERACY",
  "DOCUMENTATION",
  "WORK_ELIGIBILITY_CLARIFICATION",
  "MOBILITY_AND_LOCATION",
  "CARE_RESPONSIBILITIES",
  "CONFIDENCE_AND_SUPPORT",
  "LEARNING_AND_DEVELOPMENT",
  "PATHWAY_PREFERENCES",
  "EMPLOYMENT_BARRIERS",
  "EVIDENCE_AND_CREDIBILITY",
  "CAREER_CHANGE_OR_RETURN",
  "INFORMAL_EXPERIENCE",
  "COUNTRY_CONTEXT_CLARIFICATION"
] as const;

export type DiagnosisQuestionCategory = (typeof diagnosisQuestionCategories)[number];

export const diagnosisQuestionTypes = [
  "SINGLE_SELECT",
  "MULTI_SELECT",
  "YES_NO",
  "SCALE",
  "NUMBER_RANGE",
  "DATE_OR_DURATION",
  "SHORT_TEXT",
  "OPTIONAL_LONG_TEXT",
  "CONFIRMATION",
  "RANKING",
  "DOCUMENT_AVAILABLE",
  "LOCATION_RADIUS",
  "AVAILABILITY_PATTERN"
] as const;

export type DiagnosisQuestionType = (typeof diagnosisQuestionTypes)[number];

export const diagnosisAnswerStates = ["ANSWERED", "SKIPPED", "USER_DECLINED", "NOT_APPLICABLE", "UNKNOWN"] as const;

export type DiagnosisAnswerState = (typeof diagnosisAnswerStates)[number];

export const diagnosisSessionStatuses = ["NOT_STARTED", "IN_PROGRESS", "PAUSED", "COMPLETED", "NEEDS_REVIEW", "STALE", "FAILED"] as const;

export type DiagnosisSessionStatus = (typeof diagnosisSessionStatuses)[number];

export const diagnosisPresentationModes = ["STANDARD", "PLAIN_LANGUAGE", "HIGH_GUIDANCE", "ASSISTED"] as const;

export type DiagnosisPresentationMode = (typeof diagnosisPresentationModes)[number];

export const diagnosisRequiredness = ["REQUIRED", "CONDITIONAL", "OPTIONAL"] as const;

export type DiagnosisRequiredness = (typeof diagnosisRequiredness)[number];

export const diagnosisSensitivityLevels = ["NONE", "LOW", "MEDIUM", "HIGH"] as const;

export type DiagnosisSensitivityLevel = (typeof diagnosisSensitivityLevels)[number];
