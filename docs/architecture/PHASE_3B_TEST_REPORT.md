# Phase 3B Test Report

Status: Automated regression coverage added.

## Regression Coverage

`tests/regression.test.mjs` validates:

- pure deterministic engine boundary
- no UI, API, database, network, or AI provider imports
- explicit engine version
- engine-version change rules
- broad fixture corpus
- all 14 readiness dimensions
- canonical readiness and pathway codes
- unknown information remains `NOT_ASSESSED`
- missing work authorization remains uncertainty
- no duplicate pathway recommendations
- no NaN readiness scores
- graduate with no formal experience receives valid pathways
- technical projects support technical indications
- informal practical experience counts as strength
- limited internet increases support intensity
- transport constraints do not erase skills readiness
- low literacy support produces guided support rather than stigma
- deterministic repeated output
- input immutability
- structured explanations and confidence

## Manual QA

Phase 3B has no user-facing UI, no API route, and no persistence. Manual QA is deferred to Phase 3C when the profile is surfaced to users.
