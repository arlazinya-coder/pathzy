export const meaningfulIdentityStaleFields = [
  "currentSituation",
  "location",
  "workAuthorisation",
  "careerGoal",
  "education",
  "experience",
  "skills",
  "projects",
  "certificates",
  "licences",
  "languages",
  "references",
  "portfolio",
  "employmentPreferences",
  "salaryExpectations",
  "availability"
] as const;

export const meaningfulDiagnosisStaleFields = [
  "barriers",
  "urgency",
  "digitalAccess",
  "practicalAccess",
  "mobility",
  "jobSearchBehaviour",
  "interviewHistory",
  "supportNeeds",
  "pathwayPreferences"
] as const;

export const ignoredStaleFields = ["interfaceLanguage", "documentLanguage", "theme", "notificationPreference"] as const;

export function staleReasonForChangedFields(fields: string[]) {
  if (fields.some((field) => ignoredStaleFields.includes(field as never))) return null;
  if (fields.some((field) => meaningfulIdentityStaleFields.includes(field as never))) return "IDENTITY_CHANGED";
  if (fields.some((field) => meaningfulDiagnosisStaleFields.includes(field as never))) return "DIAGNOSIS_CHANGED";
  return "UNKNOWN";
}
