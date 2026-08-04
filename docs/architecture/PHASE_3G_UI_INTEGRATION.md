# Phase 3G UI Integration

Phase 3G integrates persisted Employment Intelligence into PATHZY screens without recalculating intelligence in UI code.

Implemented checkpoints:

- Shared authenticated client access layer under `lib/employment-intelligence/client`.
- Presentation-safe view model boundary in `employment-intelligence-view-model.ts`.
- Personalised Home at `/roadmap` reads `getDetailedEmploymentIntelligence`.
- Diagnosis Results at `/discovery/results` reads persisted intelligence after diagnosis completion.
- Career Plan route at `/roadmap/career-plan` presents persisted plan progress.
- Action cards update Action History through `/api/employment-intelligence`.

Boundary rules:

- UI does not call deterministic engines.
- UI does not rank actions.
- UI does not write directly to intelligence tables.
- UI does not accept client user IDs.
- Previous valid intelligence remains visible during failed updates.
