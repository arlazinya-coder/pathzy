import type { SupabaseClient } from "@supabase/supabase-js";
import { safeLogEmploymentIntelligenceEvent, staleReasonForChangedFields } from "../events";
import { ActionRecommendationRepository, CareerPlanRepository, EmploymentIntelligenceRepository } from "../repositories";

export async function markEmploymentIntelligenceStale(supabase: SupabaseClient, userId: string, input: { reason?: string; changedFields?: string[] }) {
  const reason = input.reason ?? staleReasonForChangedFields(input.changedFields ?? []) ?? "UNKNOWN";
  const intelligenceRepo = new EmploymentIntelligenceRepository(supabase);
  const actionRepo = new ActionRecommendationRepository(supabase);
  const planRepo = new CareerPlanRepository(supabase);
  await Promise.all([intelligenceRepo.markStale(userId, reason), actionRepo.markStale(userId, reason), planRepo.markStale(userId, reason)]);
  safeLogEmploymentIntelligenceEvent({ type: "intelligence_marked_stale", userId, reason });
  return { status: "stale_marked" as const, reason };
}
