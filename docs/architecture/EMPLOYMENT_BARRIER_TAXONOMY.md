# Employment Barrier Taxonomy

Status: Phase 3A contract
Code: `lib/employment-intelligence/domain/barriers.ts`

## Categories

- `PROFILE_AND_EVIDENCE`
- `JOB_SEARCH`
- `PRACTICAL_ACCESS`
- `QUALIFICATION`
- `LEGAL_AND_DOCUMENTATION`
- `COMMUNICATION`
- `CONFIDENCE_AND_SUPPORT`
- `MARKET_AND_STRUCTURAL`

## Severity

- `INFORMATIONAL`
- `LOW`
- `MODERATE`
- `HIGH`
- `CRITICAL`

`CRITICAL` is reserved for immediate workflow blockers. It must never be used to stigmatize a user.

## Control classification

Each barrier separates user-controlled, partly controlled, and external factors. External barriers must not be framed as personal failure.

## Phase 3A examples

The initial code includes definitions for incomplete Professional Identity, unsupported skill claims, practical access constraints, and market or structural barriers. Future definitions must include evidence requirements, confidence rules, false-positive risk, and supportive user-facing wording.
