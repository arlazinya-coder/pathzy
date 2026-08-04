# Employment Intelligence Engine Versioning

Status: Phase 3B implemented.

Current deterministic engine version:

`3B.1`

Defined in:

`lib/employment-intelligence/engine/engine-version.ts`

## Version Change Triggers

The engine version must change when any of the following affect output:

- rule changes
- taxonomy changes
- score mapping changes
- bug fixes affecting output
- country context interpretation changes

## Versioning Contract

Every generated `EmploymentIntelligenceProfile` includes:

- `engineVersion`
- `generatedAt`
- `inputSnapshotVersion`
- `staleStatus`

Future persistence must keep historical generated profiles traceable to the engine version that produced them.
