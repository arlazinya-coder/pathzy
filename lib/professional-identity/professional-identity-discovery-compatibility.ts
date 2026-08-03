export type DiscoveryCompatibilityRow = {
  id?: string | null;
  answers?: Record<string, unknown> | null;
  generated_result?: unknown;
  created_at?: string | null;
  updated_at?: string | null;
};

const identityAnswerKeys = new Set([
  "profile_photo",
  "nationality",
  "work_authorization",
  "professional_summary",
  "education_history",
  "experience_history",
  "personal_background",
  "skills",
  "projects_history",
  "achievements_list",
  "certificates_list",
  "licences",
  "languages",
  "references_list",
  "github_url",
  "website_url",
  "behance_url",
  "preferred_roles",
  "industries",
  "employment_type",
  "salary_expectations",
  "availability",
  "work_type",
  "relocation",
  "interface_language",
  "professional_document_language",
  "career_coach_intro_seen",
  "identity_started",
  "identity_reviewed",
  "identity_review_completed",
  "setup_finished",
  "setup_completed",
  "pathzy_onboarding_state"
]);

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.some(hasValue);
  if (value && typeof value === "object") return Object.values(value as Record<string, unknown>).some(hasValue);
  return typeof value === "string" ? value.trim().length > 0 : value !== null && value !== undefined && value !== false;
}

function createdTime(row: DiscoveryCompatibilityRow) {
  const source = row.updated_at ?? row.created_at ?? "";
  const time = Date.parse(source);
  return Number.isFinite(time) ? time : 0;
}

export function discoveryRecordType(row: DiscoveryCompatibilityRow) {
  const value = row.answers?._pathzy_record_type;
  return typeof value === "string" ? value : "";
}

export function professionalIdentityCompatibilityScore(row: DiscoveryCompatibilityRow) {
  const answers = row.answers ?? {};
  if (discoveryRecordType(row) === "employment_diagnosis") return -1000;
  let score = discoveryRecordType(row) === "professional_identity" ? 100 : 0;
  for (const key of Object.keys(answers)) {
    if (identityAnswerKeys.has(key) && hasValue(answers[key])) score += 2;
  }
  return score;
}

export function selectProfessionalIdentityDiscoveryRow(rows: DiscoveryCompatibilityRow[]) {
  const ranked = rows
    .filter((row) => professionalIdentityCompatibilityScore(row) >= 0)
    .sort((a, b) => {
      const scoreDelta = professionalIdentityCompatibilityScore(b) - professionalIdentityCompatibilityScore(a);
      if (scoreDelta !== 0) return scoreDelta;
      return createdTime(b) - createdTime(a);
    });
  return ranked[0] ?? null;
}

export function selectEmploymentDiagnosisDiscoveryRow(rows: DiscoveryCompatibilityRow[]) {
  const ranked = rows
    .filter((row) => discoveryRecordType(row) === "employment_diagnosis" || row.answers?.employment_diagnosis_status === "complete" || row.answers?.diagnosis_completed === true)
    .sort((a, b) => createdTime(b) - createdTime(a));
  return ranked[0] ?? null;
}

export function diagnosisWorkflowFlags(row: DiscoveryCompatibilityRow | null) {
  const answers = row?.answers ?? {};
  return {
    ...(answers.employment_diagnosis_status === "complete" ? { employment_diagnosis_status: "complete" } : {}),
    ...(answers.employment_diagnosis_completed === true ? { employment_diagnosis_completed: true } : {}),
    ...(answers.diagnosis_completed === true ? { diagnosis_completed: true } : {}),
    ...(answers.pathzy_onboarding_state === "diagnosis_completed" ? { pathzy_onboarding_state: "diagnosis_completed" } : {}),
    ...(answers.pathzy_onboarding_diagnosis_completed === true ? { pathzy_onboarding_diagnosis_completed: true } : {}),
    ...(typeof answers.employment_diagnosis_completed_at === "string" ? { employment_diagnosis_completed_at: answers.employment_diagnosis_completed_at } : {})
  };
}

export function withProfessionalIdentityRecordType(answers: Record<string, unknown>) {
  return { ...answers, _pathzy_record_type: "professional_identity" };
}

export function withEmploymentDiagnosisRecordType(answers: Record<string, unknown>) {
  return { ...answers, _pathzy_record_type: "employment_diagnosis" };
}
