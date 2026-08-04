# Employment Intelligence Explainability

Status: Phase 3A contract
Code: `lib/employment-intelligence/domain/explainability.ts`

Every major conclusion must explain:

- what PATHZY concluded
- why
- which information was used
- what is missing
- what is uncertain
- what the user can change
- what is external
- confidence
- evidence references

PATHZY must not store or expose model chain-of-thought. Explanations are structured facts suitable for concise user-facing summaries.

Confidence is based on input completeness, evidence quality, rule certainty, country-context quality, recency, and conflicting information. It is not the user's self-confidence and not the user's worth.
