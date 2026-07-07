import { getNextMilestone, getProgressMilestones, getProgressPercent, type ProgressInputs } from "@/lib/progress/progress-engine";
import { getJourneyRoute, journeyStepRoutes, type JourneyStepKey } from "@/lib/progress/journey-router";

export type OnboardingProgressInput = ProgressInputs;

export function getOnboardingRoute(step: JourneyStepKey) {
  return getJourneyRoute(step);
}

export function getOnboardingSteps(inputs: OnboardingProgressInput) {
  return getProgressMilestones(inputs);
}

export function getNextOnboardingStep(inputs: OnboardingProgressInput) {
  return getNextMilestone(inputs);
}

export function getOnboardingProgressPercent(inputs: OnboardingProgressInput) {
  return getProgressPercent(inputs);
}

export function isOnboardingComplete(inputs: OnboardingProgressInput) {
  return getProgressPercent(inputs) >= 100;
}

export { journeyStepRoutes };
