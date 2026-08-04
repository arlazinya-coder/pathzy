# Employment Intelligence Rule Registry

Status: Phase 3B deterministic registry.

## Rule Groups

| Group | File | Purpose |
| --- | --- | --- |
| Normalization | `lib/employment-intelligence/engine/normalize-input.ts` | Converts Phase 3A inputs into safe provenanced values, removes duplicate array records, and preserves explicit unknowns. |
| Signal extraction | `lib/employment-intelligence/engine/extract-signals.ts` | Converts identity and diagnosis fields into stable employment signals. |
| Evidence assessment | `lib/employment-intelligence/engine/assess-evidence.ts` | Separates self-reported, supported, verified, missing, conflicting, and unsupported evidence. |
| Missing information | `lib/employment-intelligence/engine/detect-missing-information.ts` | Identifies missing fields and whether they block reliable conclusions. |
| Barrier detection | `lib/employment-intelligence/engine/detect-barriers.ts` | Detects supportive barriers without stigmatizing the user. |
| Readiness | `lib/employment-intelligence/engine/assess-readiness.ts` | Produces the 14 Phase 3A readiness dimensions. |
| Pathways | `lib/employment-intelligence/engine/evaluate-pathways.ts` | Ranks canonical employment pathways with suitability and unmet dependencies. |
| Support intensity | `lib/employment-intelligence/engine/select-support-intensity.ts` | Chooses the guidance level based on barriers, access, missing information, and urgency. |
| Explainability | `lib/employment-intelligence/engine/build-explanations.ts` | Produces structured reasons, uncertainty, evidence references, and user-controlled factors. |

## Non-Negotiable Rule Boundaries

- No protected characteristics are used.
- No AI-generated conclusion may override deterministic eligibility, ownership, or evidence rules.
- No unknown value may be converted into a negative capability judgment.
- No low confidence or low access label may become a worth label.
- No country-specific factual claim may be made without a sourced country adapter.
