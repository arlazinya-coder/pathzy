# Employment Intelligence Architecture Overview

## Principle

Employment Intelligence is a derived, deterministic layer. Consumers read persisted intelligence through services and must not recalculate it inside pages or components.

## Flow

1. Canonical Professional Identity.
2. Employment Diagnosis.
3. Country Employment Context.
4. Deterministic Employment Intelligence engine.
5. Next-Best-Action engine.
6. Career Plan engine.
7. Persistence/versioning layer.
8. Authenticated service/API boundary.
9. UI view models.

## Key Files

- Input model: `lib/employment-intelligence/domain/employment-intelligence-input.ts`
- Profile model: `lib/employment-intelligence/domain/employment-intelligence-profile.ts`
- Engine: `lib/employment-intelligence/engine/generate-employment-intelligence.ts`
- South Africa adapter: `lib/employment-intelligence/country/adapters/south-africa/south-africa-context.ts`
- Diagnosis: `lib/employment-intelligence/diagnosis/adaptive-question-engine.ts`
- Actions: `lib/employment-intelligence/actions/next-best-action-engine.ts`
- Career Plan: `lib/employment-intelligence/actions/career-plan-engine.ts`
- Recompute orchestration: `lib/employment-intelligence/application/recompute-employment-intelligence.ts`
- Persistence repositories: `lib/employment-intelligence/repositories/*`
- Client view model: `lib/employment-intelligence/client/employment-intelligence-view-model.ts`
- UI: `components/employment-intelligence/*`

## Boundaries

- No UI component owns readiness scoring.
- No page writes raw intelligence directly.
- No client-provided user ID is trusted.
- Interface language does not change canonical codes.
- Language switching does not recompute intelligence.
- Unknown information remains unknown, not negative.
- Country context may add support context, but must not invent live market facts.
