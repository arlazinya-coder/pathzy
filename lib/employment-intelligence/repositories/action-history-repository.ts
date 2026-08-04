import type { SupabaseClient } from "@supabase/supabase-js";
import { pathzyActionRegistry, type ActionLifecycleState } from "../actions";
import type { ActionHistoryRecord, ActionHistoryTransitionInput } from "../persistence/persistence-models";

export class ActionHistoryRepository {
  private readonly validTransitions: Record<ActionLifecycleState, ActionHistoryTransitionInput["transition"][]> = {
    NOT_STARTED: ["start", "skip", "feedback"],
    READY: ["start", "skip", "feedback"],
    BLOCKED: ["skip", "feedback"],
    IN_PROGRESS: ["complete", "skip", "feedback"],
    COMPLETED: ["feedback"],
    SKIPPED: ["start", "feedback"],
    EXPIRED: ["start", "feedback"]
  };

  constructor(private supabase: SupabaseClient) {}

  private nextState(current: ActionLifecycleState, transition: ActionHistoryTransitionInput["transition"]): ActionLifecycleState {
    if (!this.validTransitions[current]?.includes(transition)) throw new Error(`Invalid action transition ${current} -> ${transition}.`);
    if (transition === "start") return "IN_PROGRESS";
    if (transition === "complete") return "COMPLETED";
    if (transition === "skip") return "SKIPPED";
    return current;
  }

  async listForUser(userId: string) {
    const { data, error } = await this.supabase
      .from("employment_action_history")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data ?? []) as ActionHistoryRecord[];
  }

  async transition(userId: string, input: ActionHistoryTransitionInput) {
    if (!pathzyActionRegistry.some((action) => action.code === input.actionCode)) throw new Error("Unknown action code.");
    const { data: existing, error: readError } = await this.supabase
      .from("employment_action_history")
      .select("*")
      .eq("user_id", userId)
      .eq("action_code", input.actionCode)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (readError) throw readError;

    const now = new Date().toISOString();
    const currentState = ((existing as ActionHistoryRecord | null)?.state ?? "NOT_STARTED") as ActionLifecycleState;
    const state = this.nextState(currentState, input.transition);
    const payload = {
      user_id: userId,
      action_code: input.actionCode,
      state,
      started_at: input.transition === "start" ? now : (existing as ActionHistoryRecord | null)?.started_at ?? null,
      completed_at: input.transition === "complete" ? now : (existing as ActionHistoryRecord | null)?.completed_at ?? null,
      skipped_at: input.transition === "skip" ? now : (existing as ActionHistoryRecord | null)?.skipped_at ?? null,
      skip_reason: input.skipReason ?? (existing as ActionHistoryRecord | null)?.skip_reason ?? null,
      user_feedback: input.feedback ?? (existing as ActionHistoryRecord | null)?.user_feedback ?? null,
      completion_proof_json: input.completionProof ?? [],
      updated_at: now
    };

    const query = existing
      ? this.supabase.from("employment_action_history").update(payload).eq("id", (existing as ActionHistoryRecord).id).eq("user_id", userId)
      : this.supabase.from("employment_action_history").insert(payload);
    const { data, error } = await query.select("*").maybeSingle();
    if (error) throw error;
    return data as ActionHistoryRecord;
  }
}
