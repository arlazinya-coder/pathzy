import type { SupabaseClient } from "@supabase/supabase-js";
import type { EmploymentIntelligenceProfile } from "../domain/employment-intelligence-profile";
import type { InputSnapshotReference } from "../persistence/persistence-models";
import { profileInsertPayload } from "../persistence/persistence-mappers";

export type CurrentIntelligenceRow = {
  id: string;
  user_id: string;
  profile_version: number;
  engine_version: string;
  input_snapshot_hash: string;
  input_snapshot_version: string;
  country_context_version: string;
  diagnosis_version: string | null;
  status: string;
  stale_status: string;
  stale_reason?: string | null;
  payload_json: EmploymentIntelligenceProfile;
  summary_json: Record<string, unknown>;
  confidence_json: Record<string, unknown>;
  updated_at: string;
};

export class EmploymentIntelligenceRepository {
  constructor(private supabase: SupabaseClient) {}

  async getCurrentByAuthenticatedUser(userId: string) {
    const { data, error } = await this.supabase
      .from("employment_intelligence_profiles")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "CURRENT")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data as CurrentIntelligenceRow | null) ?? null;
  }

  async getByVersion(userId: string, id: string) {
    const { data, error } = await this.supabase.from("employment_intelligence_profiles").select("*").eq("user_id", userId).eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as CurrentIntelligenceRow | null) ?? null;
  }

  async listVersions(userId: string, limit = 10) {
    const { data, error } = await this.supabase
      .from("employment_intelligence_profiles")
      .select("id,profile_version,engine_version,input_snapshot_hash,status,stale_status,stale_reason,generated_at,updated_at,summary_json")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  }

  async createDraft(args: {
    id: string;
    userId: string;
    profile: EmploymentIntelligenceProfile;
    snapshot: InputSnapshotReference;
    attemptId: string;
    previousValidRecordId?: string | null;
  }) {
    const { data, error } = await this.supabase.from("employment_intelligence_profiles").insert(profileInsertPayload(args)).select("*").maybeSingle();
    if (error) throw error;
    return data as CurrentIntelligenceRow;
  }

  async markStale(userId: string, reason: string) {
    const { error } = await this.supabase
      .from("employment_intelligence_profiles")
      .update({ status: "STALE", stale_status: `STALE_${reason}`, stale_reason: reason, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("status", "CURRENT");
    if (error) throw error;
  }

  async finalizeCurrent(userId: string, intelligenceId: string, recommendationId: string, careerPlanId: string) {
    const { error } = await this.supabase.rpc("finalize_employment_intelligence_current", {
      p_user_id: userId,
      p_intelligence_id: intelligenceId,
      p_recommendation_id: recommendationId,
      p_career_plan_id: careerPlanId
    });
    if (error) throw error;
  }

  async recordFailure(userId: string, id: string, failure: Record<string, unknown>) {
    const { error } = await this.supabase
      .from("employment_intelligence_profiles")
      .update({ status: "FAILED", stale_status: "FAILED_RECOMPUTE", failure_json: failure, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("id", id);
    if (error) throw error;
  }
}
