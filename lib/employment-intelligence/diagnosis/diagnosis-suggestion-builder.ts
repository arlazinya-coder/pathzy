import type { DiagnosisSuggestion, EmploymentDiagnosisSession } from "./diagnosis-models";

export function buildDiagnosisIdentitySuggestions(session: EmploymentDiagnosisSession): DiagnosisSuggestion[] {
  const informal = session.answers.informal_experience_evidence;
  if (!informal || informal.state !== "ANSWERED") return [];
  if (!["YES_WITH_REFERENCE", "YES_NO_REFERENCE"].includes(String(informal.value))) return [];

  return [
    {
      suggestionId: `suggestion-${session.id}-informal-experience`,
      targetProfessionalIdentityField: "experience",
      proposedCanonicalValue: {
        type: "informal_experience",
        evidenceStatus: informal.value === "YES_WITH_REFERENCE" ? "REFERENCE_AVAILABLE" : "REFERENCE_NEEDED"
      },
      reason: "Employment Diagnosis found informal experience that may strengthen the canonical Professional Identity after user confirmation.",
      sourceDiagnosisAnswerId: informal.questionId,
      confidence: informal.value === "YES_WITH_REFERENCE" ? 0.72 : 0.55,
      userFacingExplanation: "PATHZY found possible informal experience. You can add it to Professional Identity if it is accurate.",
      status: "PENDING",
      source: "EMPLOYMENT_DIAGNOSIS"
    }
  ];
}
