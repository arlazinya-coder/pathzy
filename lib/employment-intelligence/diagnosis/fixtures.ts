import type { EmploymentDiagnosisSession } from "./diagnosis-models";
import { answerForQuestion, applyDiagnosisAnswer, createEmploymentDiagnosisSession } from "./adaptive-question-engine";
import { diagnosisQuestionById } from "./question-registry";

function base(name: string, answers: Record<string, string | string[]> = {}, presentationMode: EmploymentDiagnosisSession["presentationMode"] = "STANDARD") {
  let session = createEmploymentDiagnosisSession({
    userId: `diagnosis-fixture-${name}`,
    inputSnapshotVersion: `${name}.identity.v1`,
    countryContextVersion: "3C.1",
    interfaceLanguage: name.includes("french") ? "fr" : "en",
    presentationMode
  });
  for (const [questionId, value] of Object.entries(answers)) {
    const question = diagnosisQuestionById(questionId);
    if (question) session = applyDiagnosisAnswer(session, answerForQuestion(question, value));
  }
  return session;
}

export const phase3dAdaptiveDiagnosisFixtures = {
  completeIdentityEmptyDiagnosis: base("complete-identity-empty"),
  partialIdentity: base("partial-identity", { job_search_activity_recent: "NOT_STARTED" }),
  graduateNoExperience: base("graduate-no-experience", { learning_development_willingness: "YES_NOW" }),
  technicalProjects: base("technical-projects", { application_quality_feedback: "SOME_RESPONSES" }),
  cleanerInformalExperience: base("cleaner-informal", { informal_experience_evidence: "YES_WITH_REFERENCE" }),
  securityLicenceUncertainty: base("security-licence", { security_registration_evidence: "UNKNOWN" }),
  retailWorker: base("retail-worker", { application_quality_feedback: "SOME_RESPONSES" }),
  artisan: base("artisan", { documentation_availability: ["CERTIFICATES"] }),
  longTermUnemployed: base("long-term-unemployed", { confidence_support_need: "GUIDED" }),
  immediateIncomeUser: base("immediate-income", { immediate_income_need: "URGENT" }),
  careerChanger: base("career-changer", { career_change_return_context: "CAREER_CHANGE" }),
  returnToWork: base("return-to-work", { career_change_return_context: "RETURN_TO_WORK" }),
  foreignQualification: base("foreign-qualification", { qualification_recognition_status: "UNKNOWN" }),
  unknownWorkAuthorisation: base("unknown-work-authorisation", { work_authorisation_clarification: "UNKNOWN" }),
  smartphoneOnly: base("smartphone-only", { device_internet_access: "SMARTPHONE_ONLY" }),
  lowLiteracyHighGuidance: base("low-literacy", { reading_writing_comfort: "HIGH_GUIDANCE" }, "HIGH_GUIDANCE"),
  professionalStrongEvidence: base("professional-strong", { job_search_activity_recent: "MANY_APPLICATIONS" }),
  entrepreneurialUser: base("entrepreneurial", { pathway_preference_signal: "SELF_EMPLOYMENT" }),
  decliningSensitiveQuestions: base("declining-sensitive", { care_responsibilities: "USER_DECLINED", work_authorisation_clarification: "USER_DECLINED" }),
  genericNonZaUser: base("generic-non-za", { mobility_radius: "REMOTE_OR_HYBRID" })
};
