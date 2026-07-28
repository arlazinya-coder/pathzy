export type NormalizedPathzyError = {
  userMessage: string;
  developerMessage: string;
  code?: string;
  originalType: "error" | "event" | "supabase" | "string" | "object" | "unknown";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function isBrowserEventLike(value: unknown): value is { type?: unknown } {
  if (typeof Event !== "undefined" && value instanceof Event) return true;
  return isRecord(value) && typeof value.type === "string" && ("target" in value || "currentTarget" in value || "isTrusted" in value);
}

export function normalizePathzyError(error: unknown, fallbackUserMessage = "Something went wrong. Please try again."): NormalizedPathzyError {
  if (error instanceof Error) {
    return {
      userMessage: error.message || fallbackUserMessage,
      developerMessage: error.stack || error.message || fallbackUserMessage,
      originalType: "error"
    };
  }

  if (isBrowserEventLike(error)) {
    const eventType = stringValue(error.type) ?? "unknown";
    return {
      userMessage: fallbackUserMessage,
      developerMessage: `Browser event failure: ${eventType}`,
      originalType: "event"
    };
  }

  if (isRecord(error)) {
    const code = stringValue(error.code);
    const message = stringValue(error.message);
    const details = stringValue(error.details);
    const hint = stringValue(error.hint);
    const developerMessage = [message, details, hint].filter(Boolean).join(" ") || fallbackUserMessage;

    return {
      userMessage: message ?? fallbackUserMessage,
      developerMessage,
      code,
      originalType: code || message ? "supabase" : "object"
    };
  }

  if (typeof error === "string") {
    return {
      userMessage: stringValue(error) ?? fallbackUserMessage,
      developerMessage: stringValue(error) ?? fallbackUserMessage,
      originalType: "string"
    };
  }

  return {
    userMessage: fallbackUserMessage,
    developerMessage: fallbackUserMessage,
    originalType: "unknown"
  };
}
