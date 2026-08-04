import type { SupabaseClient } from "@supabase/supabase-js";
import { safeLogEmploymentIntelligenceEvent } from "../events";
import type { ActionHistoryTransitionInput } from "../persistence/persistence-models";
import { ActionHistoryRepository, ActionRecommendationRepository } from "../repositories";

export async function getCurrentActionRecommendations(supabase: SupabaseClient, userId: string) {
  return new ActionRecommendationRepository(supabase).getCurrent(userId);
}

export async function updateEmploymentActionState(supabase: SupabaseClient, userId: string, input: ActionHistoryTransitionInput) {
  const record = await new ActionHistoryRepository(supabase).transition(userId, input);
  safeLogEmploymentIntelligenceEvent({ type: "action_transition", userId, actionCode: input.actionCode, transition: input.transition });
  return record;
}
