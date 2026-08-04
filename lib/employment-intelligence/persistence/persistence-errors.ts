import type { RecomputeFailureCode } from "./persistence-models";

export class EmploymentIntelligencePersistenceError extends Error {
  constructor(
    public code: RecomputeFailureCode,
    message: string,
    public retryable = true,
    public status = 500
  ) {
    super(message);
    this.name = "EmploymentIntelligencePersistenceError";
  }
}

export function safePersistenceError(error: unknown): EmploymentIntelligencePersistenceError {
  if (error instanceof EmploymentIntelligencePersistenceError) return error;
  if (error instanceof Error) return new EmploymentIntelligencePersistenceError("UNKNOWN", error.message, true, 500);
  return new EmploymentIntelligencePersistenceError("UNKNOWN", "Employment Intelligence failed safely.", true, 500);
}
