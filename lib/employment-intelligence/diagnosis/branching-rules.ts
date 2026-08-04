import type { DiagnosisQuestionDefinition, EmploymentDiagnosisSession } from "./diagnosis-models";

function textIncludes(value: unknown, terms: string[]) {
  const text = JSON.stringify(value ?? "").toLowerCase();
  return terms.some((term) => text.includes(term));
}

function hasKnownText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasKnownArray(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}

function knownWorkAuthorisation(value: unknown) {
  if (!value) return false;
  if (typeof value === "string") return value.trim().length > 0 && !["unknown", "not sure", "prefer not to say"].includes(value.trim().toLowerCase());
  if (typeof value === "object") {
    const status = String((value as Record<string, unknown>).status ?? "").toLowerCase();
    return Boolean(status && !["unknown", "user_declined", "pending", "no_authorisation_confirmed"].includes(status));
  }
  return false;
}

export function questionAlreadyAnswered(question: DiagnosisQuestionDefinition, session: EmploymentDiagnosisSession) {
  return Boolean(session.answers[question.questionId]);
}

export function questionIsKnownFromIdentity(question: DiagnosisQuestionDefinition, identity: Record<string, unknown>) {
  if (question.questionId === "work_authorisation_clarification") return knownWorkAuthorisation(identity.workAuthorisation ?? identity.work_authorization);
  if (question.questionId === "mobility_radius") return hasKnownText(identity.relocation) || hasKnownText(identity.work_type);
  if (question.questionId === "pathway_preference_signal") return hasKnownText(identity.careerGoal ?? identity.career_goal);
  if (question.questionId === "informal_experience_evidence") return hasKnownArray(identity.experience) || hasKnownArray(identity.experience_history);
  return false;
}

export function questionAppliesToContext(question: DiagnosisQuestionDefinition, identity: Record<string, unknown>, session: EmploymentDiagnosisSession, countryCode: string) {
  const profileText = JSON.stringify(identity).toLowerCase();
  const answers = session.answers;
  if (question.questionId === "qualification_recognition_status") {
    return countryCode === "ZA" && textIncludes(identity.education ?? identity.education_history, ["foreign", "international", "outside", "étranger", "etranger"]);
  }
  if (question.questionId === "security_registration_evidence") {
    return countryCode === "ZA" && textIncludes(profileText, ["security", "guard", "sécurité", "securite"]);
  }
  if (question.questionId === "application_quality_feedback") {
    const activity = String(answers.job_search_activity_recent?.value ?? "");
    return ["FEW_APPLICATIONS", "MANY_APPLICATIONS", "SEARCHING_NOT_APPLYING"].includes(activity);
  }
  if (question.questionId === "interview_history_recent") {
    const application = String(answers.application_quality_feedback?.value ?? "");
    const activity = String(answers.job_search_activity_recent?.value ?? "");
    return application === "INTERVIEWS" || activity === "MANY_APPLICATIONS";
  }
  if (question.questionId === "reading_writing_comfort") {
    const digital = String(answers.device_internet_access?.value ?? "");
    return ["LIMITED_DATA", "SHARED_DEVICE"].includes(digital) || session.presentationMode !== "STANDARD";
  }
  if (question.questionId === "informal_experience_evidence") {
    return !hasKnownArray(identity.experience) || textIncludes(profileText, ["cleaner", "domestic", "community", "family", "freelance", "self"]);
  }
  if (question.questionId === "career_change_return_context") {
    return textIncludes(identity.currentSituation ?? identity.current_status ?? identity.employment_status, ["career", "return", "reconversion", "retour"]);
  }
  return true;
}

export function shouldDeferOptional(question: DiagnosisQuestionDefinition, session: EmploymentDiagnosisSession) {
  if (question.requiredness !== "OPTIONAL") return false;
  const requiredAnswered = Object.values(session.answers).filter((answer) => {
    const definition = answer.questionId;
    return definition && answer.state;
  }).length;
  return requiredAnswered < 5;
}
