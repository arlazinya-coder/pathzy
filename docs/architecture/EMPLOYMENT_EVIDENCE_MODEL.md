# Employment Evidence Model

Status: Phase 3A contract
Code: `lib/employment-intelligence/domain/evidence.ts`

## Evidence types

- `SELF_REPORTED`
- `DOCUMENT_SUPPORTED`
- `REFERENCE_SUPPORTED`
- `PORTFOLIO_SUPPORTED`
- `VERIFIED_CREDENTIAL`
- `SYSTEM_DERIVED`
- `EXTERNAL_DATA`
- `UNKNOWN`

## Provenance states

- `KNOWN`
- `UNKNOWN`
- `NOT_APPLICABLE`
- `USER_DECLINED`
- `INFERRED`
- `VERIFIED`

## Rules

1. Self-reported information is valid but not verified.
2. Informal work and lived experience can provide meaningful evidence.
3. Lack of formal evidence must not erase real capability.
4. Verification must never be assumed.
5. Evidence confidence and user worth are unrelated.
