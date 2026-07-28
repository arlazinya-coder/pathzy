import type { CanonicalProfileVersion } from "./canonical-profile.types";
import type { CanonicalProfileVersionContext, CanonicalSourceSystem } from "./canonical-professional-identity.model";
import { canonicalNow } from "./canonical-profile-utils";

export type CanonicalVersionChangeType = CanonicalProfileVersion["changeType"];
export type CanonicalVersionActor = CanonicalProfileVersion["changedBy"];

export function nextCanonicalProfileVersion(currentVersion: number | null | undefined): number {
  const version = Number(currentVersion ?? 0);
  if (!Number.isInteger(version) || version < 0) return 1;
  return version + 1;
}

export function canonicalVersionIdempotencyKey(input: {
  userId: string;
  profileId: string;
  sourceSystem: CanonicalSourceSystem;
  sourceRecordId?: string | null;
  changeType: CanonicalVersionChangeType;
  toVersion: number;
}): string {
  return ["canonical-profile", input.userId, input.profileId, input.sourceSystem, input.sourceRecordId ?? "root", input.changeType, input.toVersion].join(":");
}

export function createCanonicalVersionContext(input: {
  userId: string;
  profileId: string;
  currentVersion: number;
  sourceSystem: CanonicalSourceSystem;
  sourceRecordId?: string | null;
  changeSummary: string;
  changeType?: CanonicalVersionChangeType;
}): CanonicalProfileVersionContext {
  const toVersion = nextCanonicalProfileVersion(input.currentVersion);
  return {
    userId: input.userId,
    profileId: input.profileId,
    fromVersion: input.currentVersion,
    toVersion,
    sourceSystem: input.sourceSystem,
    idempotencyKey: canonicalVersionIdempotencyKey({
      userId: input.userId,
      profileId: input.profileId,
      sourceSystem: input.sourceSystem,
      sourceRecordId: input.sourceRecordId,
      changeType: input.changeType ?? "field_updated",
      toVersion
    }),
    changeSummary: input.changeSummary,
    reversible: true
  };
}

export function createCanonicalProfileVersionRecord(input: {
  context: CanonicalProfileVersionContext;
  changeType: CanonicalVersionChangeType;
  changedBy: CanonicalVersionActor;
  changeSetJson: unknown;
  snapshotJson?: unknown;
}): Omit<CanonicalProfileVersion, "id"> & { userId: string } {
  return {
    userId: input.context.userId,
    profileId: input.context.profileId,
    versionNumber: input.context.toVersion,
    changeType: input.changeType,
    changedBy: input.changedBy,
    changeSummary: input.context.changeSummary,
    changeSetJson: {
      idempotencyKey: input.context.idempotencyKey,
      sourceSystem: input.context.sourceSystem,
      fromVersion: input.context.fromVersion,
      reversible: input.context.reversible,
      changes: input.changeSetJson
    },
    snapshotJson: input.snapshotJson,
    createdAt: canonicalNow()
  };
}

export function assertCanonicalVersionAdvance(input: { currentVersion: number; requestedVersion: number }): void {
  if (input.requestedVersion !== input.currentVersion + 1) {
    throw new Error(`Canonical profile versions must advance by one. Current ${input.currentVersion}, requested ${input.requestedVersion}.`);
  }
}
