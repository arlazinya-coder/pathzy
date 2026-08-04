export type EmploymentIntelligenceClientError = {
  code: string;
  message: string;
  retryable?: boolean;
};

export function safeEmploymentIntelligenceClientError(error: unknown): EmploymentIntelligenceClientError {
  if (error && typeof error === "object" && "message" in error) {
    return {
      code: "CLIENT_REQUEST_FAILED",
      message: typeof error.message === "string" ? error.message : "PATHZY could not update employment insights yet.",
      retryable: true
    };
  }
  return { code: "CLIENT_REQUEST_FAILED", message: "PATHZY could not update employment insights yet.", retryable: true };
}
