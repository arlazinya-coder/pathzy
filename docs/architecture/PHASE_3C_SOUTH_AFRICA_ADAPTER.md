# Phase 3C South Africa Employment Context Adapter

Status: Implemented.

Phase 3C adds South Africa as the first full country adapter for PATHZY Employment Intelligence.

The adapter lives under:

`lib/employment-intelligence/country/adapters/south-africa/`

It provides structural, versioned, source-aware country context to the deterministic Phase 3B engine. It does not perform live web fetching, job matching, legal advice, salary estimation, programme eligibility, or UI rendering.

## Boundary

The adapter may provide:

- province structure
- qualification and recognition contracts
- matric/non-matric pathway context
- TVET, trade, apprenticeship, internship, graduate and learnership contracts
- work-authorisation states and evidence requirements
- job-level and occupational context
- practical access context
- language and low-literacy support context
- formal and informal work evidence mapping
- source metadata and unavailable-data markers

The adapter must not:

- overwrite Professional Identity
- infer work authorisation from nationality
- invent salary values
- invent current programme openings
- claim market demand
- claim legal eligibility
- replace the country-neutral engine
- redesign user interfaces

## Version

Current adapter version:

`3C.1`

Defined in:

`lib/employment-intelligence/country/adapters/south-africa/data-status.ts`
