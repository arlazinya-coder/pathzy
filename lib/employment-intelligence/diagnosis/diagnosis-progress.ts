import type { DiagnosisProgress, EmploymentDiagnosisSession } from "./diagnosis-models";
import { employmentDiagnosisQuestionRegistry } from "./question-registry";

export function evaluateDiagnosisProgress(session: EmploymentDiagnosisSession, unresolvedQuestionIds: string[]): DiagnosisProgress {
  const answeredRequired = employmentDiagnosisQuestionRegistry.filter((question) => question.requiredness !== "OPTIONAL" && session.answeredQuestionIds.includes(question.questionId));
  const requiredQuestions = employmentDiagnosisQuestionRegistry.filter((question) => question.requiredness !== "OPTIONAL");
  const unresolvedHighPriorityTopics = unresolvedQuestionIds.slice(0, 6);
  const answeredHighPriorityTopics = answeredRequired.map((question) => question.category);
  const completionConfidence = Math.min(0.95, Math.max(0.1, answeredRequired.length / Math.max(1, requiredQuestions.length)));
  const estimatedRemainingQuestions = Math.min(6, unresolvedHighPriorityTopics.length);
  const canComplete = answeredRequired.length >= 5 && unresolvedHighPriorityTopics.length <= 3;

  return {
    stage: canComplete ? "Ready to summarise" : "Understanding practical employment needs",
    answeredHighPriorityTopics: Array.from(new Set(answeredHighPriorityTopics)),
    unresolvedHighPriorityTopics,
    estimatedRemainingQuestions,
    completionConfidence,
    canComplete,
    explanation: estimatedRemainingQuestions > 0 ? `About ${estimatedRemainingQuestions} useful questions remaining.` : "Enough information is available for a first diagnosis."
  };
}
