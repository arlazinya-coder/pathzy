import type { SupabaseClient, User } from "@supabase/supabase-js";
import { EMPLOYMENT_ACTION_ENGINE_VERSION_3E } from "../actions";
import { safeLogEmploymentIntelligenceEvent } from "../events";
import { recomputeIdempotencyKey } from "../persistence/idempotency";
import { EmploymentIntelligencePersistenceError, safePersistenceError } from "../persistence/persistence-errors";
import {
  ActionRecommendationRepository,
  CareerPlanRepository,
  EmploymentIntelligenceRepository,
  RecomputeAttemptRepository
} from "../repositories";
import { buildEmploymentIntelligenceInputs, runDeterministicEmploymentIntelligence } from "./employment-intelligence-orchestrator";

export async function recomputeEmploymentIntelligence(args: {
  supabase: SupabaseClient;
  authenticatedUser: Pick<User, "id" | "email">;
  trigger: string;
  force?: boolean;
  idempotencyKey?: string;
}) {
  const currentRepo = new EmploymentIntelligenceRepository(args.supabase);
  const actionRepo = new ActionRecommendationRepository(args.supabase);
  const planRepo = new CareerPlanRepository(args.supabase);
  const attemptRepo = new RecomputeAttemptRepository(args.supabase);
  const current = await currentRepo.getCurrentByAuthenticatedUser(args.authenticatedUser.id);
  const input = await buildEmploymentIntelligenceInputs(args.supabase, args.authenticatedUser);
  const draft = runDeterministicEmploymentIntelligence(input);
  const idempotencyKey =
    args.idempotencyKey ??
    recomputeIdempotencyKey({
      userId: args.authenticatedUser.id,
      inputSnapshotHash: draft.snapshot.inputSnapshotHash,
      engineVersion: draft.profile.engineVersion,
      countryContextVersion: draft.snapshot.countryContextVersion,
      trigger: args.trigger
    });

  if (!args.force && current?.input_snapshot_hash === draft.snapshot.inputSnapshotHash && current.engine_version === draft.profile.engineVersion && current.stale_status === "CURRENT") {
    const existingAttempt = await attemptRepo.getByIdempotencyKey(args.authenticatedUser.id, idempotencyKey);
    if (!existingAttempt) {
      await attemptRepo.create(args.authenticatedUser.id, {
        id: draft.ids.attemptId,
        idempotencyKey,
        trigger: args.trigger,
        inputSnapshotHash: draft.snapshot.inputSnapshotHash,
        engineVersion: draft.profile.engineVersion
      });
      await attemptRepo.finish(args.authenticatedUser.id, draft.ids.attemptId, "SKIPPED", { reason: "same_input_versions_current" });
    }
    safeLogEmploymentIntelligenceEvent({ type: "recompute_skipped", userId: args.authenticatedUser.id, reason: "same_input_versions_current", inputSnapshotHash: draft.snapshot.inputSnapshotHash });
    return { status: "skipped" as const, current };
  }

  const attempt = await attemptRepo.create(args.authenticatedUser.id, {
    id: draft.ids.attemptId,
    idempotencyKey,
    trigger: args.trigger,
    inputSnapshotHash: draft.snapshot.inputSnapshotHash,
    engineVersion: draft.profile.engineVersion
  });
  safeLogEmploymentIntelligenceEvent({ type: "recompute_started", userId: args.authenticatedUser.id, attemptId: draft.ids.attemptId, inputSnapshotHash: draft.snapshot.inputSnapshotHash, engineVersion: draft.profile.engineVersion, startedAt: new Date().toISOString() });
  const started = Date.now();

  try {
    const intelligence = await currentRepo.createDraft({
      id: draft.ids.intelligenceProfileId,
      userId: args.authenticatedUser.id,
      profile: draft.profile,
      snapshot: draft.snapshot,
      attemptId: String(attempt?.id ?? draft.ids.attemptId),
      previousValidRecordId: current?.id ?? null
    });
    const recommendation = await actionRepo.createDraft({
      id: draft.ids.actionRecommendationId,
      userId: args.authenticatedUser.id,
      intelligenceProfileId: intelligence.id,
      actionSet: draft.actionSet,
      snapshot: draft.snapshot
    });
    const careerPlan = await planRepo.createDraft({
      id: draft.ids.careerPlanId,
      userId: args.authenticatedUser.id,
      intelligenceProfileId: intelligence.id,
      actionRecommendationId: String(recommendation?.id ?? draft.ids.actionRecommendationId),
      plan: draft.careerPlan,
      snapshot: draft.snapshot
    });
    await currentRepo.finalizeCurrent(args.authenticatedUser.id, intelligence.id, String(recommendation?.id), String(careerPlan?.id));
    await attemptRepo.finish(args.authenticatedUser.id, draft.ids.attemptId, "SUCCEEDED", { engineVersion: draft.profile.engineVersion, actionEngineVersion: EMPLOYMENT_ACTION_ENGINE_VERSION_3E });
    safeLogEmploymentIntelligenceEvent({ type: "recompute_succeeded", userId: args.authenticatedUser.id, attemptId: draft.ids.attemptId, intelligenceProfileId: intelligence.id, durationMs: Date.now() - started });
    return { status: "current" as const, current: await currentRepo.getCurrentByAuthenticatedUser(args.authenticatedUser.id) };
  } catch (error) {
    const safeError = safePersistenceError(error);
    const previous_valid_preserved = Boolean(current);
    await attemptRepo.fail(args.authenticatedUser.id, draft.ids.attemptId, safeError.code, safeError.message, safeError.retryable).catch(() => undefined);
    safeLogEmploymentIntelligenceEvent({ type: "recompute_failed", userId: args.authenticatedUser.id, attemptId: draft.ids.attemptId, safeErrorCode: safeError.code, retryable: safeError.retryable });
    if (previous_valid_preserved && current) return { status: "failed_previous_valid_preserved" as const, current, error: safeError };
    throw new EmploymentIntelligencePersistenceError(safeError.code, safeError.message, safeError.retryable, safeError.status);
  }
}
