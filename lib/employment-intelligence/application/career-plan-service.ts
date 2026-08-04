import type { SupabaseClient } from "@supabase/supabase-js";
import { ActionHistoryRepository, CareerPlanRepository } from "../repositories";

export async function getCurrentCareerPlan(supabase: SupabaseClient, userId: string) {
  return new CareerPlanRepository(supabase).getCurrent(userId);
}

export async function refreshCareerPlanProgressFromActionHistory(supabase: SupabaseClient, userId: string) {
  const planRepo = new CareerPlanRepository(supabase);
  const currentPlan = await planRepo.getCurrent(userId);
  if (!currentPlan) return null;
  const history = await new ActionHistoryRepository(supabase).listForUser(userId);
  const completed = new Set(history.filter((item) => item.state === "COMPLETED").map((item) => item.action_code));
  const plan = (currentPlan as { plan_json?: { steps?: Array<{ actionCode?: string }> } }).plan_json;
  const totalSteps = plan?.steps?.length ?? 0;
  const completedSteps = plan?.steps?.filter((step) => step.actionCode && completed.has(step.actionCode)).length ?? 0;
  return planRepo.updateProgress(userId, String((currentPlan as { id: string }).id), { completedSteps, totalSteps });
}
