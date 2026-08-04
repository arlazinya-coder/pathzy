# Employment Intelligence Architecture

Status: Phase 3A target architecture
Date: 2026-08-04

## Dependency direction

1. Canonical inputs:
   - Professional Identity
   - Employment Diagnosis
   - Country Employment Context
   - Opportunity or labour context where available
2. Intelligence processing:
   - Signal extraction
   - Evidence assessment
   - Readiness assessment
   - Barrier detection
   - Pathway recommendation
   - Next-best-action selection
   - Career Plan construction
   - Explainability
   - Confidence and missing-information handling
3. Derived output:
   - Employment Intelligence Profile
4. Consumers:
   - Personalised Home
   - Employment Diagnosis results
   - Career Coach
   - CV and document recommendations
   - Opportunity matching
   - Applications
   - Interview Preparation
   - Career Growth

Consumers may read the Employment Intelligence Profile. Consumers must not independently recalculate readiness, barriers, pathways, or next actions.

## Existing code audit

Retain:
- `lib/canonical-profile/*` as the Professional Identity source layer.
- `lib/readiness/employment-readiness-check.ts` as the separate readiness/diagnosis intake.
- `lib/job-intelligence/*` as existing job import and match infrastructure.
- `lib/interview/*`, `lib/follow-up/*`, and application tracker services as downstream consumers.

Deprecate later behind Phase 3 contracts:
- `lib/pathzy-brain/*` readiness labels and simple scores.
- Legacy user-facing "Roadmap" language where it means Career Plan.
- Match headlines that present a percentage before explanation.

Must not be reused as the Phase 3 authority:
- Per-page or route-level readiness calculations.
- Mock recommendations with no source evidence.
- Hard-coded country conclusions or unsupported South Africa facts.
- Generic "not ready" labels that can stigmatize the user.
