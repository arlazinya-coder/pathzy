import type { SupabaseClient } from "@supabase/supabase-js";
import type { RecomputeAttemptStatus } from "../persistence/persistence-models";

export class RecomputeAttemptRepository {
  constructor(private supabase: SupabaseClient) {}

  async getByIdempotencyKey(userId: string, idempotencyKey: string) {
    const { data, error } = await this.supabase
      .from("employment_intelligence_recompute_attempts")
      .select("*")
      .eq("user_id", userId)
      .eq("idempotency_key", idempotencyKey)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ?? null;
  }

  async create(userId: string, input: { id: string; idempotencyKey: string; trigger: string; inputSnapshotHash: string; engineVersion: string }) {
    const { data, error } = await this.supabase
      .from("employment_intelligence_recompute_attempts")
      .insert({
        id: input.id,
        user_id: userId,
        idempotency_key: input.idempotencyKey,
        trigger: input.trigger,
        input_snapshot_hash: input.inputSnapshotHash,
        engine_version: input.engineVersion,
        status: "RUNNING"
      })
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async finish(userId: string, id: string, status: RecomputeAttemptStatus, metadata: Record<string, unknown> = {}) {
    const finishedAt = new Date().toISOString();
    const { error } = await this.supabase
      .from("employment_intelligence_recompute_attempts")
      .update({ status, finished_at: finishedAt, metadata_json: metadata, updated_at: finishedAt })
      .eq("user_id", userId)
      .eq("id", id);
    if (error) throw error;
  }

  async fail(userId: string, id: string, safeErrorCode: string, safeMessage: string, retryable = true) {
    const finishedAt = new Date().toISOString();
    const { error } = await this.supabase
      .from("employment_intelligence_recompute_attempts")
      .update({ status: "FAILED", finished_at: finishedAt, safe_error_code: safeErrorCode, safe_error_message: safeMessage, retryable, updated_at: finishedAt })
      .eq("user_id", userId)
      .eq("id", id);
    if (error) throw error;
  }
}
