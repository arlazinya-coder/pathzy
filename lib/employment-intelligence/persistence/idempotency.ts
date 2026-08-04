import { deterministicInputHash } from "./versioning";

export function recomputeIdempotencyKey(input: {
  userId: string;
  inputSnapshotHash: string;
  engineVersion: string;
  countryContextVersion: string;
  trigger: string;
}) {
  return deterministicInputHash({
    userId: input.userId,
    inputSnapshotHash: input.inputSnapshotHash,
    engineVersion: input.engineVersion,
    countryContextVersion: input.countryContextVersion,
    trigger: input.trigger
  });
}
