import type { ActionHistoryTransitionInput } from "../persistence/persistence-models";

export type EmploymentIntelligenceApiOperation =
  | { operation: "recompute"; force?: boolean; trigger?: string; idempotencyKey?: string }
  | { operation: "retry"; idempotencyKey?: string }
  | ({ operation: "action_transition" } & ActionHistoryTransitionInput)
  | { operation: "mark_stale"; reason?: string };

export function parseEmploymentIntelligenceOperation(value: unknown): EmploymentIntelligenceApiOperation {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const operation = String(source.operation ?? "");
  if (operation === "recompute" || operation === "retry") {
    return {
      operation,
      force: source.force === true,
      trigger: typeof source.trigger === "string" ? source.trigger : operation,
      idempotencyKey: typeof source.idempotencyKey === "string" ? source.idempotencyKey : undefined
    };
  }
  if (operation === "action_transition") {
    const actionCode = typeof source.actionCode === "string" ? source.actionCode : "";
    const transition = typeof source.transition === "string" ? source.transition : "";
    if (!["start", "complete", "skip", "feedback"].includes(transition)) throw new Error("Unsupported action transition.");
    return {
      operation,
      actionCode,
      transition: transition as ActionHistoryTransitionInput["transition"],
      feedback: source.feedback as ActionHistoryTransitionInput["feedback"],
      skipReason: typeof source.skipReason === "string" ? source.skipReason : undefined,
      completionProof: Array.isArray(source.completionProof) ? source.completionProof.map(String) : undefined
    };
  }
  if (operation === "mark_stale") return { operation, reason: typeof source.reason === "string" ? source.reason : "MANUAL_REVIEW_REQUIRED" };
  throw new Error("Unsupported Employment Intelligence operation.");
}
