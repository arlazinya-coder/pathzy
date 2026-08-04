import { buildEmploymentDiagnosisResult } from "../diagnosis/diagnosis-result-builder";
import { phase3dAdaptiveDiagnosisFixtures } from "../diagnosis/fixtures";

export const phase3eNextActionFixtures = {
  immediateIncomeDiagnosis: buildEmploymentDiagnosisResult(phase3dAdaptiveDiagnosisFixtures.immediateIncomeUser),
  qualificationRecognitionDiagnosis: buildEmploymentDiagnosisResult(phase3dAdaptiveDiagnosisFixtures.foreignQualification),
  practicalAccessDiagnosis: buildEmploymentDiagnosisResult(phase3dAdaptiveDiagnosisFixtures.smartphoneOnly),
  highGuidanceDiagnosis: buildEmploymentDiagnosisResult(phase3dAdaptiveDiagnosisFixtures.lowLiteracyHighGuidance)
};

export const phase3eCareerPlanScenarioMatrix = [
  "graduate_no_experience",
  "it_candidate_with_projects",
  "cleaner_informal_experience",
  "security_registration_uncertainty",
  "retail_worker",
  "artisan",
  "long_term_unemployed_user",
  "immediate_income_user",
  "career_changer",
  "return_to_work_user",
  "foreign_qualified_professional",
  "unknown_work_authorisation",
  "smartphone_only_user",
  "lower_literacy_high_guidance_user",
  "strong_professional_profile",
  "entrepreneurial_user",
  "non_matric_skills_first_user",
  "completed_cv_no_applications",
  "applications_no_interviews",
  "interview_invitation",
  "generic_non_za_user",
  "most_actions_already_completed"
] as const;
