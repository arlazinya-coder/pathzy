# Phase 3B Deterministic Employment Intelligence Core

Status: Implemented as a pure deterministic engine.

Phase 3B transforms:

Professional Identity + Employment Diagnosis + Country Context -> Employment Intelligence Profile

The engine is intentionally not a UI, API route, database repository, AI prompt, job-matching service, or Career Plan generator. It produces a deterministic, explainable profile that later phases may persist or present.

## Implemented Modules

- `lib/employment-intelligence/engine/normalize-input.ts`
- `lib/employment-intelligence/engine/extract-signals.ts`
- `lib/employment-intelligence/engine/assess-evidence.ts`
- `lib/employment-intelligence/engine/detect-missing-information.ts`
- `lib/employment-intelligence/engine/detect-barriers.ts`
- `lib/employment-intelligence/engine/assess-readiness.ts`
- `lib/employment-intelligence/engine/evaluate-pathways.ts`
- `lib/employment-intelligence/engine/select-support-intensity.ts`
- `lib/employment-intelligence/engine/build-explanations.ts`
- `lib/employment-intelligence/engine/generate-employment-intelligence.ts`
- `lib/employment-intelligence/engine/fixtures.ts`

## Engine Boundary

Allowed:

- canonical Phase 3A domain contracts
- deterministic rule functions
- fixture inputs
- structured explanations
- confidence and missing-information outputs

Not allowed in Phase 3B:

- AI providers
- Supabase clients or persistence
- API routes
- React components
- live job matching
- salary or live labour-market facts
- automatic application actions
- South Africa-specific factual inference without a sourced adapter

## Output

The orchestrator is `generateEmploymentIntelligence(input, context)`.

The traceable test entrypoint is `generateEmploymentIntelligenceWithTrace(input, context)`.

Both require an explicit assessed time through `context.assessedAt` so repeated runs with the same input and context are deterministic.

## Safety Principles

- Unknown information remains unknown.
- Missing work authorization is uncertainty, not a conclusion that the user cannot work.
- Practical access constraints affect support intensity and pathway fit, not capability.
- Informal work, projects, caregiving, volunteering, and self-reported experience may count as evidence while remaining unverified.
- Confidence is separate from readiness and never measures user worth.
- Canonical codes are language-independent. Presentation layers translate labels.
