import type { ActionDefinition, ActionDocumentState, ActionHistoryItem } from "./action-models";

export function completedActionCodes(history: ActionHistoryItem[] = [], documentState: ActionDocumentState = {}) {
  const completed = new Set(history.filter((item) => item.state === "COMPLETED").map((item) => item.actionCode));
  if (documentState.hasCv) completed.add("CREATE_FIRST_CV");
  if (documentState.hasCoverLetter) completed.add("CREATE_COVER_LETTER");
  if (documentState.hasLinkedInDraft) completed.add("PREPARE_LINKEDIN_PROFILE");
  if (documentState.hasTargetOpportunity) {
    completed.add("FIND_RELEVANT_OPPORTUNITIES");
    completed.add("ANALYSE_TARGET_JOB");
  }
  if (documentState.hasSubmittedApplication) {
    completed.add("PREPARE_APPLICATION_PACKAGE");
    completed.add("TRACK_APPLICATION");
  }
  if (documentState.hasInterview) completed.add("PREPARE_FOR_INTERVIEW");
  return completed;
}

export function isActionCompleted(action: ActionDefinition, completed: Set<string>) {
  return completed.has(action.code) && action.repeatability !== "ONGOING" && action.repeatability !== "PER_OPPORTUNITY";
}
