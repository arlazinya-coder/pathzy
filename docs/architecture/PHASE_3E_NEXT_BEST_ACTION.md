# Phase 3E Next-Best-Action and Career Plan

Phase 3E adds the deterministic recommendation layer after Employment Intelligence.

Locked dependency direction:

Professional Identity + Employment Diagnosis + Country Context -> Employment Intelligence Profile -> Next-Best-Action Engine -> Career Plan -> Home, Diagnosis Results, Career Coach and Employment Center.

Consumers may display the derived result. Consumers must not independently calculate action priority.

Phase 3E does not add persistence, production APIs, live job matching, generative AI, salary values, live programme names, automatic applications or UI redesign.

Implemented source:

- `lib/employment-intelligence/actions/action-models.ts`
- `lib/employment-intelligence/actions/action-registry.ts`
- `lib/employment-intelligence/actions/action-eligibility.ts`
- `lib/employment-intelligence/actions/action-dependencies.ts`
- `lib/employment-intelligence/actions/action-priority.ts`
- `lib/employment-intelligence/actions/next-best-action-engine.ts`
- `lib/employment-intelligence/actions/career-plan-engine.ts`
- `lib/employment-intelligence/engine/generate-employment-intelligence.ts`

The engine returns exactly one primary action when a valid candidate exists and up to three secondary actions.
