# Employment Intelligence Recomputation

`recomputeEmploymentIntelligence` is the authoritative workflow.

It creates a recompute attempt, computes the derived output, persists drafts and finalizes current records through a database function.

Failure behavior:

- prior current intelligence remains readable
- attempt is marked failed
- safe error code is stored
- no partial draft is marked current
- retry is allowed when safe

Duplicate requests use an idempotency key based on user, input hash, engine version, country-context version and trigger.
