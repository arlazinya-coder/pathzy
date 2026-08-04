import type { CurrentIntelligenceRow } from "../repositories";

export function notGeneratedResponse() {
  return { status: "not_generated" as const, message: "Employment Intelligence has not been generated yet." };
}

export function currentIntelligenceSummary(row: CurrentIntelligenceRow | null, actions?: unknown, careerPlan?: { progress_json?: unknown; updated_at?: string } | null) {
  if (!row) return notGeneratedResponse();
  return {
    status: row.stale_status === "CURRENT" ? "current" : "stale",
    intelligenceProfileId: row.id,
    profileVersion: row.profile_version,
    engineVersion: row.engine_version,
    inputSnapshotHash: row.input_snapshot_hash,
    staleStatus: row.stale_status,
    staleReason: row.stale_reason ?? null,
    readinessBand: row.summary_json?.readinessBand,
    confidence: row.confidence_json,
    primaryAction: (actions as { action_set_json?: { primary?: unknown } } | null)?.action_set_json?.primary ?? row.payload_json?.nextBestAction,
    secondaryActions: (actions as { action_set_json?: { secondary?: unknown[] } } | null)?.action_set_json?.secondary ?? row.payload_json?.secondaryActions ?? [],
    careerPlanProgress: careerPlan?.progress_json ?? row.payload_json?.careerPlan?.progress,
    updatedAt: careerPlan?.updated_at ?? row.updated_at
  };
}
