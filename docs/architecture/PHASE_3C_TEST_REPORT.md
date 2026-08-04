# Phase 3C Test Report

Status: Automated regression coverage added.

`tests/regression.test.mjs` validates:

- ZA resolves to the South Africa adapter.
- unsupported and missing countries resolve safely to generic context.
- invalid ZA province is marked unavailable.
- adapter version is present.
- source metadata and source IDs exist and are unique.
- unavailable live data is explicit.
- all nine provinces are present.
- English/French province labels do not change canonical codes.
- NQF levels are not invented.
- foreign qualification recognition remains unknown until evidenced.
- non-matric users retain skills-first and practical pathways.
- TVET/trade programme data remains unavailable.
- nationality is not work authorisation.
- security registration dependency is surfaced.
- informal evidence counts.
- limited internet and transport affect practical support.
- salary data contains no invented values.
- deterministic engine output remains stable.
- adapter integration does not mutate inputs.
