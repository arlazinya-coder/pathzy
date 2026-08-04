export const intelligenceStaleStatuses = [
  "CURRENT",
  "STALE_INPUT_CHANGED",
  "STALE_ENGINE_CHANGED",
  "STALE_COUNTRY_CONTEXT_CHANGED",
  "RECOMPUTING",
  "FAILED_RECOMPUTE"
] as const;

export type EmploymentIntelligenceStaleStatus = (typeof intelligenceStaleStatuses)[number];

export const recomputationTriggerFields = [
  "career_goal",
  "current_situation",
  "education",
  "experience",
  "skills",
  "work_authorisation",
  "location",
  "availability",
  "employment_preferences",
  "diagnosis_answers",
  "country_context",
  "engine_version"
] as const;

export const recomputationNonTriggers = ["theme", "harmless_ui_preference", "non_employment_notification_preference"] as const;
