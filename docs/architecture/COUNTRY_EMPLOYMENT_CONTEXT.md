# Country Employment Context

Status: Phase 3A contract
Code: `lib/employment-intelligence/domain/country-context.ts`

## Contract

Country context includes country code, version, effective date, source metadata, qualification framework, region model, job taxonomy mapping, work-authorisation context, recruitment conventions, employment programme contract, salary-data contract, language context, transport/geographic context, formal/informal employment context, low-literacy support, data freshness, and unavailable-data markers.

## Generic adapter

Phase 3A includes a safe generic adapter with no live country facts. It marks missing data explicitly instead of pretending unsupported knowledge exists.

## Source rules

Every external fact must include source, effective date, version, confidence, and expiry or update policy.
