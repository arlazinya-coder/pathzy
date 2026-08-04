import type { CareerPlan, CareerPlanHorizon, CareerPlanStep } from "../domain/career-plan";
import type { NextBestActionSet } from "../domain/next-best-action";
import { EMPLOYMENT_ACTION_ENGINE_VERSION_3E } from "./action-version";
import type { NextActionEngineInput } from "./action-models";
import { actionByCode, pathzyActionRegistry } from "./action-registry";

function stepFor(actionCode: string, horizon: CareerPlanHorizon, state: CareerPlanStep["state"] = "NOT_STARTED", dependency?: string): CareerPlanStep | null {
  const action = actionByCode(actionCode);
  if (!action) return null;
  return {
    id: `phase3e-${horizon.toLowerCase()}-${action.code.toLowerCase()}`,
    stepId: `phase3e-${horizon.toLowerCase()}-${action.code.toLowerCase()}`,
    actionCode: action.code,
    horizon,
    action: action.title,
    title: action.title,
    titleKey: action.titleKey,
    explanationKey: action.explanationKey,
    reason: action.plainLanguageExplanation,
    reasonCodes: action.reasonCodes,
    pathzySupportFeature: action.destination.route,
    dependency,
    dependencies: action.prerequisites,
    dependencyCodes: action.prerequisites,
    measurableOutcome: action.completionCriteria[0] ?? "The action is reviewed and either completed, blocked or deferred.",
    expectedOutcome: action.completionCriteria[0] ?? "The action is reviewed and either completed, blocked or deferred.",
    completionCriteria: action.completionCriteria,
    supportRoute: action.destination.route,
    state,
    urgency: action.urgency,
    effort: action.effort,
    evidence: [],
    confidence: {
      level: "MEDIUM",
      rationale: ["phase3e.career_plan.step_from_action_registry"],
      inputCompleteness: 0.6,
      evidenceQuality: 0.45,
      ruleCertainty: 0.78,
      countryContextQuality: 0.35,
      recency: 0.7,
      conflictingInformation: []
    },
    sourceEngineVersion: EMPLOYMENT_ACTION_ENGINE_VERSION_3E
  };
}

function uniqueSteps(steps: Array<CareerPlanStep | null>) {
  const seen = new Set<string>();
  return steps.filter((step): step is CareerPlanStep => {
    if (!step || seen.has(step.actionCode ?? step.id)) return false;
    seen.add(step.actionCode ?? step.id);
    return true;
  });
}

export function generateCareerPlan(input: NextActionEngineInput, actionSet: NextBestActionSet): CareerPlan {
  const primaryStep = stepFor(actionSet.primary.actionCode, "TODAY", actionSet.primary.blockedBy.length ? "BLOCKED" : "NOT_STARTED");
  const thisWeekSteps = actionSet.secondary.map((action) => stepFor(action.actionCode, "THIS_WEEK", action.blockedBy.length ? "BLOCKED" : "NOT_STARTED", action.blockedBy[0]));
  const pathwayAction = input.intelligenceProfile.pathwayRecommendations[0]?.pathwayCode;
  const monthAction =
    pathwayAction === "QUALIFICATION_RECOGNITION" ? "INVESTIGATE_QUALIFICATION_RECOGNITION" :
    pathwayAction === "LICENCE_OR_CERTIFICATE" ? "CONFIRM_LICENCE_OR_CERTIFICATE" :
    pathwayAction === "SKILLS_FIRST_TRANSITION" || pathwayAction === "CAREER_CHANGE" ? "IMPROVE_PRIORITY_SKILL" :
    "FIND_RELEVANT_OPPORTUNITIES";
  const longerTermAction = input.diagnosisResult?.immediateNeeds.includes("URGENT_INCOME") ? "IMPROVE_PRIORITY_SKILL" : "PREPARE_FOR_INTERVIEW";
  const steps = uniqueSteps([
    primaryStep,
    ...thisWeekSteps,
    stepFor(monthAction, "THIS_MONTH"),
    stepFor("PREPARE_APPLICATION_PACKAGE", "NEXT_3_MONTHS", "BLOCKED", "ANALYSE_TARGET_JOB"),
    stepFor(longerTermAction, "LONGER_TERM")
  ]);

  return {
    id: `career-plan-${input.intelligenceProfile.userId}-${EMPLOYMENT_ACTION_ENGINE_VERSION_3E}`,
    userId: input.intelligenceProfile.userId,
    version: 1,
    generatedAt: input.intelligenceProfile.generatedAt,
    engineVersion: EMPLOYMENT_ACTION_ENGINE_VERSION_3E,
    inputIntelligenceVersion: input.intelligenceProfile.engineVersion,
    pathwayCode: input.intelligenceProfile.pathwayRecommendations[0]?.pathwayCode,
    primaryPathway: input.intelligenceProfile.pathwayRecommendations[0]?.pathwayCode,
    immediateGoal: input.diagnosisResult?.immediateNeeds.includes("URGENT_INCOME") ? "Stabilise immediate income options while preserving the longer-term pathway." : actionSet.primary.title,
    longTermGoal: input.intelligenceProfile.pathwayRecommendations[0]?.reason ?? "Move toward suitable employment using confirmed Professional Identity evidence.",
    horizons: ["TODAY", "THIS_WEEK", "THIS_MONTH", "NEXT_3_MONTHS", "LONGER_TERM"],
    dependencies: Object.fromEntries(pathzyActionRegistry.map((action) => [action.code, action.prerequisites])),
    progress: {
      completedSteps: steps.filter((step) => step.state === "COMPLETED").length,
      totalSteps: steps.length
    },
    confidence: input.intelligenceProfile.confidence,
    explanations: [
      "Career Plan is derived from Employment Intelligence and action history.",
      "Career Plan does not overwrite Professional Identity.",
      "Immediate-income needs can reorder actions without lowering the user's long-term pathway."
    ],
    status: input.intelligenceProfile.confidence.level === "VERY_LOW" ? "NEEDS_MORE_INFORMATION" : "DRAFT",
    supportIntensity: input.intelligenceProfile.supportIntensity,
    planStatus: input.intelligenceProfile.confidence.level === "VERY_LOW" ? "NEEDS_MORE_INFORMATION" : "DRAFT",
    primaryActionCode: actionSet.primary.actionCode,
    actionRegistryVersion: EMPLOYMENT_ACTION_ENGINE_VERSION_3E,
    steps,
    dependencyGraph: Object.fromEntries(pathzyActionRegistry.map((action) => [action.code, action.prerequisites])),
    staleStatus: "CURRENT"
  };
}
