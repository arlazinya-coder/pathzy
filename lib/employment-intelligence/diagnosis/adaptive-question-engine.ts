import { normalizeSupportedLanguage } from "@/lib/language/language-preferences";
import type { AdaptiveQuestionEngineResult, DiagnosisBranchDecision, DiagnosisQuestionContext, DiagnosisQuestionDefinition, EmploymentDiagnosisAnswer, EmploymentDiagnosisSession } from "./diagnosis-models";
import { EMPLOYMENT_DIAGNOSIS_ENGINE_VERSION_3D, EMPLOYMENT_DIAGNOSIS_SCHEMA_VERSION_3D } from "./diagnosis-version";
import { questionAlreadyAnswered, questionAppliesToContext, questionIsKnownFromIdentity, shouldDeferOptional } from "./branching-rules";
import { evaluateDiagnosisProgress } from "./diagnosis-progress";
import { diagnosisQuestionById, employmentDiagnosisQuestionRegistry } from "./question-registry";

function nowIso() {
  return new Date().toISOString();
}

export function createEmploymentDiagnosisSession(args: {
  userId: string;
  inputSnapshotVersion: string;
  countryContextVersion: string;
  interfaceLanguage?: string | null;
  explanationLanguage?: string | null;
  presentationMode?: EmploymentDiagnosisSession["presentationMode"];
}): EmploymentDiagnosisSession {
  const now = nowIso();
  return {
    id: `diagnosis-${args.userId}-${now}`,
    userId: args.userId,
    version: EMPLOYMENT_DIAGNOSIS_SCHEMA_VERSION_3D,
    status: "IN_PROGRESS",
    startedAt: now,
    updatedAt: now,
    completedAt: null,
    currentQuestionId: null,
    answeredQuestionIds: [],
    skippedQuestionIds: [],
    answers: {},
    branchHistory: [],
    inputSnapshotVersion: args.inputSnapshotVersion,
    countryContextVersion: args.countryContextVersion,
    engineVersion: EMPLOYMENT_DIAGNOSIS_ENGINE_VERSION_3D,
    interfaceLanguage: normalizeSupportedLanguage(args.interfaceLanguage),
    explanationLanguage: normalizeSupportedLanguage(args.explanationLanguage ?? args.interfaceLanguage),
    presentationMode: args.presentationMode ?? "STANDARD",
    resultVersion: null,
    staleStatus: "CURRENT"
  };
}

export function normalizeEmploymentDiagnosisSession(value: unknown, fallback: EmploymentDiagnosisSession): EmploymentDiagnosisSession {
  if (!value || typeof value !== "object") return fallback;
  const source = value as Partial<EmploymentDiagnosisSession>;
  const answers = source.answers && typeof source.answers === "object" ? source.answers : {};
  return {
    ...fallback,
    ...source,
    status: source.status ?? fallback.status,
    answeredQuestionIds: Array.isArray(source.answeredQuestionIds) ? source.answeredQuestionIds.filter(Boolean) : Object.keys(answers),
    skippedQuestionIds: Array.isArray(source.skippedQuestionIds) ? source.skippedQuestionIds.filter(Boolean) : [],
    answers: answers as EmploymentDiagnosisSession["answers"],
    branchHistory: Array.isArray(source.branchHistory) ? source.branchHistory : [],
    interfaceLanguage: normalizeSupportedLanguage(source.interfaceLanguage, fallback.interfaceLanguage),
    explanationLanguage: normalizeSupportedLanguage(source.explanationLanguage, fallback.explanationLanguage),
    presentationMode: source.presentationMode ?? fallback.presentationMode,
    updatedAt: source.updatedAt ?? fallback.updatedAt
  };
}

function branch(questionId: string, decision: DiagnosisBranchDecision["decision"], reason: string): DiagnosisBranchDecision {
  return {
    id: `branch-${questionId}-${decision}`,
    questionId,
    decision,
    reason,
    createdAt: nowIso()
  };
}

function unresolvedQuestions(context: DiagnosisQuestionContext): { question: DiagnosisQuestionDefinition; decision: DiagnosisBranchDecision }[] {
  return employmentDiagnosisQuestionRegistry
    .slice()
    .sort((a, b) => a.priority - b.priority || a.questionId.localeCompare(b.questionId))
    .flatMap((question) => {
      if (questionAlreadyAnswered(question, context.session)) return [];
      if (questionIsKnownFromIdentity(question, context.professionalIdentity)) return [{ question, decision: branch(question.questionId, "SKIP_KNOWN_IDENTITY", "Professional Identity already contains this reliable fact.") }];
      if (!questionAppliesToContext(question, context.professionalIdentity, context.session, context.countryContext.countryCode)) return [{ question, decision: branch(question.questionId, "SKIP_NOT_RELEVANT", "This question is not relevant to the current identity, answers, or country context.") }];
      if (shouldDeferOptional(question, context.session)) return [{ question, decision: branch(question.questionId, "DEFER_OPTIONAL", "Optional refinement is deferred until high-value diagnostic areas are answered.") }];
      return [{ question, decision: branch(question.questionId, "ASK", question.whyAsked[context.interfaceLanguage] ?? question.purpose) }];
    });
}

export function selectNextDiagnosisQuestion(context: DiagnosisQuestionContext): AdaptiveQuestionEngineResult {
  const decisions = unresolvedQuestions(context);
  const askable = decisions.find((item) => item.decision.decision === "ASK");
  const unresolvedHighValueQuestions = decisions.filter((item) => item.decision.decision === "ASK").map((item) => item.question.questionId);
  const progress = evaluateDiagnosisProgress(context.session, unresolvedHighValueQuestions);
  const nextQuestion = askable?.question ?? null;
  const branchDecision = askable?.decision ?? branch("diagnosis_complete", "COMPLETE", "Enough high-value diagnostic information is available.");

  return {
    nextQuestion,
    reasonForAsking: branchDecision.reason,
    branchDecision,
    estimatedRemainingQuestions: progress.estimatedRemainingQuestions,
    progress,
    canComplete: progress.canComplete || !nextQuestion,
    unresolvedHighValueQuestions
  };
}

export function applyDiagnosisAnswer(session: EmploymentDiagnosisSession, answer: EmploymentDiagnosisAnswer): EmploymentDiagnosisSession {
  const question = diagnosisQuestionById(answer.questionId);
  const nextMode =
    answer.questionId === "reading_writing_comfort" && ["SOME_HELP", "HIGH_GUIDANCE"].includes(String(answer.value))
      ? String(answer.value) === "HIGH_GUIDANCE"
        ? "HIGH_GUIDANCE"
        : "PLAIN_LANGUAGE"
      : session.presentationMode;
  return {
    ...session,
    status: "IN_PROGRESS",
    updatedAt: nowIso(),
    currentQuestionId: null,
    presentationMode: nextMode,
    answers: { ...session.answers, [answer.questionId]: answer },
    answeredQuestionIds: Array.from(new Set([...session.answeredQuestionIds, answer.questionId])),
    branchHistory: question ? [...session.branchHistory, branch(answer.questionId, "ASK", question.purpose)] : session.branchHistory
  };
}

export function answerForQuestion(question: DiagnosisQuestionDefinition, value: unknown, state: EmploymentDiagnosisAnswer["state"] = "ANSWERED"): EmploymentDiagnosisAnswer {
  const safeValue = Array.isArray(value)
    ? value.map((item) => String(item)).filter(Boolean)
    : value === null || typeof value === "number" || typeof value === "boolean"
      ? value
      : String(value ?? "");
  return {
    questionId: question.questionId,
    state,
    value: safeValue,
    answeredAt: nowIso(),
    source: "USER",
    questionVersion: question.version
  };
}
