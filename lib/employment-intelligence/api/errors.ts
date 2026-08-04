import { NextResponse } from "next/server";
import { EmploymentIntelligencePersistenceError, safePersistenceError } from "../persistence/persistence-errors";

export function employmentIntelligenceApiError(error: unknown) {
  const safeError = safePersistenceError(error);
  const status = safeError instanceof EmploymentIntelligencePersistenceError ? safeError.status : 500;
  return NextResponse.json(
    {
      error: {
        code: safeError.code,
        message: safeError.retryable ? "PATHZY could not update Employment Intelligence yet. Your previous result is safe." : safeError.message,
        retryable: safeError.retryable
      }
    },
    { status }
  );
}
