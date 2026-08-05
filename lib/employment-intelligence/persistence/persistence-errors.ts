import type { RecomputeFailureCode } from "./persistence-models";

type SupabaseLikeError = {
  code?: unknown;
  message?: unknown;
  details?: unknown;
  hint?: unknown;
};

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

function supabaseDiagnostic(error: unknown): { code: string; message: string } | null {
  if (!error || typeof error !== "object") return null;
  const record = error as SupabaseLikeError;
  const code = typeof record.code === "string" ? record.code : "";
  const message = typeof record.message === "string" ? record.message : "";
  if (!code && !message) return null;
  return { code: code || "UNKNOWN", message };
}

export function isEmploymentIntelligenceSchemaUnavailable(error: unknown) {
  const diagnostic = supabaseDiagnostic(error);
  if (!diagnostic) return false;
  return diagnostic.code === "PGRST205" || diagnostic.code === "PGRST202" || /schema cache|could not find the table|could not find the function/i.test(diagnostic.message);
}

export function safeEmploymentIntelligenceDiagnostic(error: unknown) {
  const diagnostic = supabaseDiagnostic(error);
  if (diagnostic) return diagnostic;
  if (error instanceof EmploymentIntelligencePersistenceError) return { code: error.code, message: error.message };
  if (error instanceof Error) return { code: "ERROR", message: error.message };
  return { code: "UNKNOWN", message: "Employment Intelligence failed safely." };
}

export function safePersistenceError(error: unknown): EmploymentIntelligencePersistenceError {
  if (error instanceof EmploymentIntelligencePersistenceError) return error;
  if (isEmploymentIntelligenceSchemaUnavailable(error)) {
    return new EmploymentIntelligencePersistenceError("PERSISTENCE_FAILURE", "Employment Intelligence storage is not ready yet. Apply the Phase 3 persistence migration.", false, 503);
  }
  const diagnostic = supabaseDiagnostic(error);
  if (diagnostic?.code === "42501" || /permission denied|row-level security|rls/i.test(diagnostic?.message ?? "")) {
    return new EmploymentIntelligencePersistenceError("PERSISTENCE_FAILURE", "Employment Intelligence access was denied for this account.", false, 403);
  }
  if (error instanceof Error) return new EmploymentIntelligencePersistenceError("UNKNOWN", "Employment Intelligence failed safely.", true, 500);
  return new EmploymentIntelligencePersistenceError("UNKNOWN", "Employment Intelligence failed safely.", true, 500);
}
