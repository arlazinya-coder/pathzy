import type { ActionHistoryTransitionInput } from "../persistence/persistence-models";
import { safeEmploymentIntelligenceClientError } from "./employment-intelligence-errors";

async function employmentIntelligenceRequest<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      },
      credentials: "same-origin"
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = payload?.error ?? {};
      throw new Error(typeof error.message === "string" ? error.message : "Employment Intelligence request failed.");
    }
    return payload.data as T;
  } catch (error) {
    throw safeEmploymentIntelligenceClientError(error);
  }
}

export function fetchEmploymentIntelligenceSummary<T>() {
  return employmentIntelligenceRequest<T>("/api/employment-intelligence");
}

export function fetchEmploymentIntelligenceDetail<T>() {
  return employmentIntelligenceRequest<T>("/api/employment-intelligence?detail=true");
}

export function requestEmploymentIntelligenceRecompute<T>(trigger = "user_requested_update") {
  return employmentIntelligenceRequest<T>("/api/employment-intelligence", {
    method: "POST",
    body: JSON.stringify({ operation: "recompute", trigger, force: true })
  });
}

export function retryEmploymentIntelligence<T>() {
  return employmentIntelligenceRequest<T>("/api/employment-intelligence", {
    method: "POST",
    body: JSON.stringify({ operation: "retry" })
  });
}

export function updateEmploymentAction<T>(input: ActionHistoryTransitionInput) {
  return employmentIntelligenceRequest<T>("/api/employment-intelligence", {
    method: "POST",
    body: JSON.stringify({ operation: "action_transition", ...input })
  });
}
