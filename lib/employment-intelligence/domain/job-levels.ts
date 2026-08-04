export const jobLevels = [
  "FOUNDATIONAL",
  "SERVICE",
  "OPERATIONAL",
  "CLERICAL",
  "TECHNICAL",
  "SKILLED_TRADE",
  "GRADUATE",
  "PROFESSIONAL",
  "MANAGEMENT",
  "EXECUTIVE",
  "ENTREPRENEURIAL"
] as const;

export type JobLevel = (typeof jobLevels)[number];

export const userSegmentConsiderations = [
  "cleaner",
  "security_worker",
  "domestic_worker",
  "retail_worker",
  "driver",
  "warehouse_worker",
  "artisan",
  "administrator",
  "technician",
  "graduate",
  "professional",
  "manager",
  "executive",
  "entrepreneur",
  "career_changer",
  "return_to_work_user",
  "no_formal_experience",
  "informal_experience",
  "low_literacy",
  "limited_internet_or_device_access",
  "immediate_income_need"
] as const;

export type UserSegmentConsideration = (typeof userSegmentConsiderations)[number];

export type JobLevelAssessment = {
  level: JobLevel;
  userFacingLanguage: string;
  evidenceUsed: string[];
  exclusions: string[];
  confidence: string;
};
