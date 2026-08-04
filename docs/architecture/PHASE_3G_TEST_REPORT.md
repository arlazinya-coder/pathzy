# Phase 3G Test Report

Automated coverage added to `tests/regression.test.mjs` verifies:

- Home reads persisted Employment Intelligence through the Phase 3F service layer.
- The UI exposes one primary action and at most three secondary actions.
- Action transitions use the authenticated API and Action History.
- Career Plan progress is presented from persisted data.
- Diagnosis Results use persisted intelligence.
- Freshness and failed-update states preserve previous valid results.
- English and French presentation use canonical codes.
- The UI does not call deterministic engines, use OpenAI, add live job matching or trust client user IDs.

Founder QA remains required for authenticated browser flows.
