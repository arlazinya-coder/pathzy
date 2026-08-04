import type { SupabaseClient } from "@supabase/supabase-js";
import type { CareerPlan } from "../domain/career-plan";
import type { InputSnapshotReference } from "../persistence/persistence-models";
import { careerPlanInsertPayload } from "../persistence/persistence-mappers";

export class CareerPlanRepository {
  constructor(private supabase: SupabaseClient) {}

  async getCurrent(userId: string) {
    const { data, error } = await this.supabase
      .from("employment_career_plans")
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
    actionRecommendationId: string;
    plan: CareerPlan;
    snapshot: InputSnapshotReference;
  }) {
    const { data, error } = await this.supabase.from("employment_career_plans").insert(careerPlanInsertPayload(args)).select("*").maybeSingle();
    if (error) throw error;
    return data;
  }

  async updateProgress(userId: string, planId: string, progress: Record<string, unknown>) {
    const { data, error } = await this.supabase
      .from("employment_career_plans")
      .update({ progress_json: progress, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("id", planId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async markStale(userId: string, reason: string) {
    const { error } = await this.supabase
      .from("employment_career_plans")
      .update({ status: "STALE", stale_status: `STALE_${reason}`, stale_reason: reason, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("status", "CURRENT");
    if (error) throw error;
  }
}
