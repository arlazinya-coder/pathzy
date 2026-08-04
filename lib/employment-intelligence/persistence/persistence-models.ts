import type { ActionLifecycleState } from "../actions";
import type { CareerPlan } from "../domain/career-plan";
import type { EmploymentIntelligenceProfile } from "../domain/employment-intelligence-profile";
import type { NextBestActionSet } from "../domain/next-best-action";

export const intelligenceRecordStatuses = ["DRAFT", "CURRENT", "SUPERSEDED", "STALE", "RECOMPUTING", "FAILED", "ARCHIVED"] as const;
export type IntelligenceRecordStatus = (typeof intelligenceRecordStatuses)[number];

export const intelligenceStaleReasons = [
  "IDENTITY_CHANGED",
  "DIAGNOSIS_CHANGED",
  "COUNTRY_CONTEXT_CHANGED",
  "ENGINE_VERSION_CHANGED",
  "ACTION_HISTORY_CHANGED",
  "EXTERNAL_CONTEXT_STALE",
  "MANUAL_REVIEW_REQUIRED",
  "UNKNOWN"
] as const;
export type IntelligenceStaleReason = (typeof intelligenceStaleReasons)[number];

export const recomputeAttemptStatuses = ["RUNNING", "SUCCEEDED", "FAILED", "SKIPPED"] as const;
export type RecomputeAttemptStatus = (typeof recomputeAttemptStatuses)[number];

export const recomputeFailureCodes = [
  "INPUT_INVALID",
  "IDENTITY_UNAVAILABLE",
  "DIAGNOSIS_UNAVAILABLE",
  "COUNTRY_CONTEXT_UNAVAILABLE",
  "ENGINE_FAILURE",
  "VALIDATION_FAILURE",
  "PERSISTENCE_FAILURE",
  "CONCURRENCY_CONFLICT",
  "TIMEOUT",
  "UNKNOWN"
] as const;
export type RecomputeFailureCode = (typeof recomputeFailureCodes)[number];

export type PersistedIntelligenceBundle = {
  intelligence: EmploymentIntelligenceProfile;
  actions: NextBestActionSet;
  careerPlan: CareerPlan;
};

export type InputSnapshotReference = {
  userId: string;
  inputSnapshotVersion: string;
  inputSnapshotHash: string;
  identityVersion: string;
  diagnosisVersion: string;
  countryCode: string;
  countryContextVersion: string;
  engineVersion: string;
  actionEngineVersion: string;
  careerPlanVersion: string;
};

export type EmploymentIntelligenceSummaryResponse = {
  status: "not_generated" | "current" | "stale" | "recomputing" | "failed";
  intelligenceProfileId?: string;
  profileVersion?: number;
  engineVersion?: string;
  inputSnapshotHash?: string;
  staleStatus?: string;
  staleReason?: string | null;
  readinessBand?: string;
  confidence?: unknown;
  primaryAction?: unknown;
  secondaryActions?: unknown[];
  careerPlanProgress?: { completedSteps: number; totalSteps: number };
  updatedAt?: string;
};

export type ActionHistoryTransitionInput = {
  actionCode: string;
  transition: "start" | "complete" | "skip" | "feedback";
  feedback?: "HELPFUL" | "NOT_NOW" | "NOT_RELEVANT" | "CONFUSING";
  skipReason?: string;
  completionProof?: string[];
};

export type ActionHistoryRecord = {
  id: string;
  user_id: string;
  action_code: string;
  state: ActionLifecycleState;
  source_engine_version?: string | null;
  user_feedback?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  skipped_at?: string | null;
  skip_reason?: string | null;
  updated_at?: string | null;
};
