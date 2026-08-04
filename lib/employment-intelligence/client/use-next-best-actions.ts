"use client";

import { useState } from "react";
import type { ActionHistoryTransitionInput } from "../persistence/persistence-models";
import { updateEmploymentAction } from "./employment-intelligence-client";
import { safeEmploymentIntelligenceClientError, type EmploymentIntelligenceClientError } from "./employment-intelligence-errors";

export function useNextBestActions() {
  const [pendingActionCode, setPendingActionCode] = useState<string | null>(null);
  const [error, setError] = useState<EmploymentIntelligenceClientError | null>(null);

  async function transition(input: ActionHistoryTransitionInput) {
    setPendingActionCode(input.actionCode);
    setError(null);
    try {
      return await updateEmploymentAction(input);
    } catch (nextError) {
      setError(safeEmploymentIntelligenceClientError(nextError));
      return null;
    } finally {
      setPendingActionCode(null);
    }
  }

  return { transition, pendingActionCode, error };
}
