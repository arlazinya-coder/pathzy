import type { DiagnosisFinding, EmploymentDiagnosisResult, EmploymentDiagnosisSession } from "./diagnosis-models";
import { EMPLOYMENT_DIAGNOSIS_ENGINE_VERSION_3D, EMPLOYMENT_DIAGNOSIS_RESULT_VERSION_3D } from "./diagnosis-version";
import { buildDiagnosisIdentitySuggestions } from "./diagnosis-suggestion-builder";

function values(session: EmploymentDiagnosisSession) {
  return Object.fromEntries(Object.entries(session.answers).map(([key, answer]) => [key, answer.value]));
}

function finding(code: string, category: DiagnosisFinding["category"], explanation: string, questionId: string, severity: DiagnosisFinding["severity"] = "SUPPORT", sensitive = false): DiagnosisFinding {
  return {
    code,
    severity,
    category,
    explanation,
    evidenceQuestionIds: [questionId],
    sensitive
  };
}

export function buildEmploymentDiagnosisResult(session: EmploymentDiagnosisSession): EmploymentDiagnosisResult {
  const answerValues = values(session);
  const findings: DiagnosisFinding[] = [];
  const practicalConstraints: string[] = [];
  const immediateNeeds: string[] = [];
  const digitalAccessNeeds: string[] = [];
  const supportNeeds: string[] = [];
  const preferredPathwaySignals: string[] = [];
  const evidenceGaps: string[] = [];
  const unansweredImportantQuestions: string[] = [];

  if (answerValues.immediate_income_need === "URGENT") {
    immediateNeeds.push("URGENT_INCOME");
    findings.push(finding("IMMEDIATE_INCOME_NEED", "IMMEDIATE_INCOME_NEED", "User needs income urgently, so practical short-term pathways should be prioritised.", "immediate_income_need", "IMPORTANT", true));
  }
  if (Array.isArray(answerValues.transport_shift_access) && answerValues.transport_shift_access.some((item) => ["TRANSPORT_LIMIT", "SHIFT_LIMIT", "LOCAL_ONLY"].includes(String(item)))) {
    practicalConstraints.push("TRANSPORT_OR_SHIFT_LIMIT");
    findings.push(finding("PRACTICAL_ACCESS_CONSTRAINT", "PRACTICAL_ACCESS", "Transport, shifts, or local access may affect suitable next steps.", "transport_shift_access", "SUPPORT", true));
  }
  if (["LIMITED_DATA", "SHARED_DEVICE", "SMARTPHONE_ONLY"].includes(String(answerValues.device_internet_access))) {
    digitalAccessNeeds.push(String(answerValues.device_internet_access));
    findings.push(finding("DIGITAL_ACCESS_SUPPORT", "DIGITAL_ACCESS", "Digital access should shape the pace and format of PATHZY actions.", "device_internet_access"));
  }
  if (["SOME_HELP", "HIGH_GUIDANCE"].includes(String(answerValues.reading_writing_comfort))) {
    supportNeeds.push(String(answerValues.reading_writing_comfort));
    findings.push(finding("PLAIN_LANGUAGE_SUPPORT", "COMMUNICATION_AND_LITERACY", "Plain-language or high-guidance support is useful.", "reading_writing_comfort", "SUPPORT", true));
  }
  if (answerValues.work_authorisation_clarification && !["CONFIRMED", "NOT_APPLICABLE"].includes(String(answerValues.work_authorisation_clarification))) {
    findings.push(finding("WORK_ELIGIBILITY_UNCERTAIN", "WORK_ELIGIBILITY_CLARIFICATION", "Work authorisation remains uncertain or conditional and should be handled carefully.", "work_authorisation_clarification", "IMPORTANT", true));
  }
  if (answerValues.qualification_recognition_status && !["RECOGNISED", "NOT_APPLICABLE"].includes(String(answerValues.qualification_recognition_status))) {
    evidenceGaps.push("QUALIFICATION_RECOGNITION_EVIDENCE");
  }
  if (answerValues.security_registration_evidence && !["AVAILABLE", "NOT_APPLICABLE"].includes(String(answerValues.security_registration_evidence))) {
    evidenceGaps.push("SECURITY_REGISTRATION_EVIDENCE");
  }
  if (answerValues.pathway_preference_signal) {
    preferredPathwaySignals.push(String(answerValues.pathway_preference_signal));
  }

  for (const questionId of ["immediate_income_need", "job_search_activity_recent", "transport_shift_access", "device_internet_access", "documentation_availability"]) {
    if (!session.answers[questionId]) unansweredImportantQuestions.push(questionId);
  }

  const confidence = Math.min(0.95, Math.max(0.25, (session.answeredQuestionIds.length - unansweredImportantQuestions.length * 0.35) / 10));

  return {
    summaryCodes: Array.from(new Set(["ADAPTIVE_DIAGNOSIS", ...findings.map((item) => item.code)])),
    diagnosisStatus: unansweredImportantQuestions.length <= 2 ? "ENOUGH_FOR_INTELLIGENCE" : "PARTIAL",
    primaryEmploymentSituation: typeof answerValues.career_change_return_context === "string" ? answerValues.career_change_return_context : null,
    strongestSignals: session.answeredQuestionIds,
    majorBarriers: findings,
    practicalConstraints,
    immediateNeeds,
    workEligibilityUncertainty: findings.some((item) => item.code === "WORK_ELIGIBILITY_UNCERTAIN"),
    digitalAccessNeeds,
    supportNeeds,
    preferredPathwaySignals,
    evidenceGaps,
    unansweredImportantQuestions,
    identitySuggestions: buildDiagnosisIdentitySuggestions(session),
    readinessImpactReferences: Array.from(new Set(findings.flatMap((item) => {
      if (item.category === "DIGITAL_ACCESS") return ["DIGITAL_ACCESS_READINESS"] as const;
      if (item.category === "PRACTICAL_ACCESS") return ["PRACTICAL_ACCESS_READINESS"] as const;
      if (item.category === "WORK_ELIGIBILITY_CLARIFICATION") return ["WORK_ELIGIBILITY_READINESS"] as const;
      return ["CONFIDENCE_AND_SUPPORT_READINESS"] as const;
    }))),
    countryContextReferences: [session.countryContextVersion],
    confidence,
    explanationFacts: [
      "Diagnosis answers supplement Professional Identity; they do not overwrite canonical facts.",
      "Sensitive answers are used for support and safe workflow decisions only.",
      `Diagnosis engine ${EMPLOYMENT_DIAGNOSIS_ENGINE_VERSION_3D}.`
    ],
    diagnosisVersion: EMPLOYMENT_DIAGNOSIS_RESULT_VERSION_3D,
    generatedAt: new Date().toISOString()
  };
}
