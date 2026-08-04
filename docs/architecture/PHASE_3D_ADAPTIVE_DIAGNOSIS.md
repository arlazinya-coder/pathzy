# Phase 3D Adaptive Employment Diagnosis

Phase 3D replaces the live `/discovery` experience with a deterministic, adaptive, evidence-aware diagnosis session while preserving the existing route and `discovery_responses` compatibility table.

## Completed Scope

- Canonical diagnosis session, answer, progress, finding, suggestion, and result models.
- Deterministic question taxonomy and branching engine.
- Server-backed save/resume through diagnosis-marked `discovery_responses` records.
- Structured diagnosis result generation.
- Mapping from diagnosis result into the Phase 3B Employment Intelligence input contract.
- South Africa country-context adaptation through the Phase 3C adapter.
- English and French labels using canonical answer codes.

## Boundaries

Employment Diagnosis supplements Professional Identity. It never owns or overwrites canonical identity facts such as name, education, experience, location, nationality, work authorisation, skills, or availability.

Phase 3D does not implement final Career Plan generation, final Next-Best-Action prioritisation, live job matching, generative AI decisions, or Phase 3E logic.
