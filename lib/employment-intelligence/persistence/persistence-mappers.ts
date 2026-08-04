import type { CareerPlan } from "../domain/career-plan";
import type { EmploymentIntelligenceProfile } from "../domain/employment-intelligence-profile";
import type { NextBestActionSet } from "../domain/next-best-action";
import type { InputSnapshotReference } from "./persistence-models";

export function intelligenceSummaryJson(profile: EmploymentIntelligenceProfile) {
  return {
    readinessBand: profile.overallReadiness.readinessBand,
    supportIntensity: profile.supportIntensity,
    topStrengths: profile.strengths.slice(0, 3).map((item) => item.subject),
    topBarriers: profile.barriers.slice(0, 3).map((item) => item.definitionCode),
    missingInformation: profile.missingInformation.slice(0, 8),
    primaryActionCode: profile.nextBestAction.actionCode,
    secondaryActionCodes: profile.secondaryActions.map((action) => action.actionCode)
  };
}

export function actionSetPayload(actionSet: NextBestActionSet) {
  return {
    primary: actionSet.primary,
    secondary: actionSet.secondary
  };
}

export function careerPlanProgress(plan: CareerPlan) {
  const totalSteps = plan.steps.length;
  const completedSteps = plan.steps.filter((step) => step.state === "COMPLETED").length;
  return { completedSteps, totalSteps };
}

export function profileInsertPayload(args: {
  id: string;
  userId: string;
  profile: EmploymentIntelligenceProfile;
  snapshot: InputSnapshotReference;
  attemptId: string;
  previousValidRecordId?: string | null;
}) {
  return {
    id: args.id,
    user_id: args.userId,
    profile_version: args.profile.version,
    engine_version: args.profile.engineVersion,
    input_snapshot_version: args.snapshot.inputSnapshotVersion,
    input_snapshot_hash: args.snapshot.inputSnapshotHash,
    identity_version: args.snapshot.identityVersion,
    country_code: args.snapshot.countryCode,
    country_context_version: args.snapshot.countryContextVersion,
    diagnosis_version: args.snapshot.diagnosisVersion,
    generated_at: args.profile.generatedAt,
    status: "DRAFT",
    stale_status: "CURRENT",
    confidence_json: args.profile.confidence,
    payload_json: args.profile,
    summary_json: intelligenceSummaryJson(args.profile),
    previous_valid_record_id: args.previousValidRecordId ?? null,
    recompute_attempt_id: args.attemptId,
    updated_at: new Date().toISOString()
  };
}

export function actionRecommendationInsertPayload(args: {
  id: string;
  userId: string;
  intelligenceProfileId: string;
  actionSet: NextBestActionSet;
  snapshot: InputSnapshotReference;
}) {
  return {
    id: args.id,
    user_id: args.userId,
    intelligence_profile_id: args.intelligenceProfileId,
    recommendation_version: 1,
    action_engine_version: args.snapshot.actionEngineVersion,
    input_snapshot_hash: args.snapshot.inputSnapshotHash,
    primary_action_code: args.actionSet.primary.actionCode,
    status: "DRAFT",
    stale_status: "CURRENT",
    action_set_json: actionSetPayload(args.actionSet),
    confidence_json: args.actionSet.primary.confidence,
    updated_at: new Date().toISOString()
  };
}

export function careerPlanInsertPayload(args: {
  id: string;
  userId: string;
  intelligenceProfileId: string;
  actionRecommendationId: string;
  plan: CareerPlan;
  snapshot: InputSnapshotReference;
}) {
  return {
    id: args.id,
    user_id: args.userId,
    intelligence_profile_id: args.intelligenceProfileId,
    action_recommendation_id: args.actionRecommendationId,
    plan_version: args.plan.version ?? 1,
    career_plan_engine_version: args.snapshot.careerPlanVersion,
    input_snapshot_hash: args.snapshot.inputSnapshotHash,
    status: "DRAFT",
    stale_status: "CURRENT",
    plan_json: args.plan,
    progress_json: careerPlanProgress(args.plan),
    confidence_json: args.plan.confidence ?? null,
    updated_at: new Date().toISOString()
  };
}
