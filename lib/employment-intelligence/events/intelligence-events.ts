export type EmploymentIntelligenceEvent =
  | { type: "recompute_started"; userId: string; attemptId: string; inputSnapshotHash: string; engineVersion: string; startedAt: string }
  | { type: "recompute_skipped"; userId: string; attemptId?: string; reason: string; inputSnapshotHash: string }
  | { type: "recompute_succeeded"; userId: string; attemptId: string; intelligenceProfileId: string; durationMs: number }
  | { type: "recompute_failed"; userId: string; attemptId?: string; safeErrorCode: string; retryable: boolean }
  | { type: "intelligence_marked_stale"; userId: string; reason: string }
  | { type: "action_transition"; userId: string; actionCode: string; transition: string };

export function safeLogEmploymentIntelligenceEvent(event: EmploymentIntelligenceEvent) {
  console.info("[employment-intelligence]", event);
}
