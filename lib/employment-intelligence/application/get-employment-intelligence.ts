import type { SupabaseClient } from "@supabase/supabase-js";
import { currentIntelligenceSummary } from "../api/responses";
import { safeEmploymentIntelligenceDiagnostic, safePersistenceError } from "../persistence/persistence-errors";
import { ActionRecommendationRepository, CareerPlanRepository, EmploymentIntelligenceRepository } from "../repositories";

export async function getEmploymentIntelligenceSummary(supabase: SupabaseClient, userId: string) {
  const intelligenceRepo = new EmploymentIntelligenceRepository(supabase);
  const actionRepo = new ActionRecommendationRepository(supabase);
  const planRepo = new CareerPlanRepository(supabase);
  const [current, actions, plan] = await Promise.all([intelligenceRepo.getCurrentByAuthenticatedUser(userId), actionRepo.getCurrent(userId), planRepo.getCurrent(userId)]);
  return currentIntelligenceSummary(current, actions, plan);
}

export async function getDetailedEmploymentIntelligence(supabase: SupabaseClient, userId: string) {
  const intelligenceRepo = new EmploymentIntelligenceRepository(supabase);
  const actionRepo = new ActionRecommendationRepository(supabase);
  const planRepo = new CareerPlanRepository(supabase);
  try {
    const [current, actions, plan] = await Promise.all([intelligenceRepo.getCurrentByAuthenticatedUser(userId), actionRepo.getCurrent(userId), planRepo.getCurrent(userId)]);
    if (!current) return { status: "not_generated" as const };
    return {
      status: current.stale_status === "CURRENT" ? "current" : "stale",
      intelligence: current.payload_json,
      actions: (actions as { action_set_json?: unknown } | null)?.action_set_json ?? null,
      careerPlan: (plan as { plan_json?: unknown } | null)?.plan_json ?? null,
      updatedAt: (plan as { updated_at?: string } | null)?.updated_at ?? current.updated_at,
      versions: await intelligenceRepo.listVersions(userId, 10)
    };
  } catch (error) {
    const safeError = safePersistenceError(error);
    const diagnostic = safeEmploymentIntelligenceDiagnostic(error);
    console.warn("[employment-intelligence] detailed read fallback used", {
      userId,
      code: diagnostic.code,
      message: diagnostic.message,
      safeCode: safeError.code,
      status: safeError.status
    });
    return {
      status: "unavailable" as const,
      safeError: {
        code: safeError.code,
        message: safeError.message,
        retryable: safeError.retryable,
        status: safeError.status
      }
    };
  }
}
