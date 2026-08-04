import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextBestActionSet } from "../domain/next-best-action";
import type { InputSnapshotReference } from "../persistence/persistence-models";
import { actionRecommendationInsertPayload } from "../persistence/persistence-mappers";

export class ActionRecommendationRepository {
  constructor(private supabase: SupabaseClient) {}

  async getCurrent(userId: string) {
    const { data, error } = await this.supabase
      .from("employment_action_recommendations")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "CURRENT")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ?? null;
  }

  async createDraft(args: {
    id: string;
    userId: string;
    intelligenceProfileId: string;
    actionSet: NextBestActionSet;
    snapshot: InputSnapshotReference;
  }) {
    const { data, error } = await this.supabase.from("employment_action_recommendations").insert(actionRecommendationInsertPayload(args)).select("*").maybeSingle();
    if (error) throw error;
    return data;
  }

  async markStale(userId: string, reason: string) {
    const { error } = await this.supabase
      .from("employment_action_recommendations")
      .update({ status: "STALE", stale_status: `STALE_${reason}`, stale_reason: reason, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("status", "CURRENT");
    if (error) throw error;
  }
}
