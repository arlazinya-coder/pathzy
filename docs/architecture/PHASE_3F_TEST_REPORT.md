# Phase 3F Test Report

Automated validation added in `tests/regression.test.mjs` verifies:

- versioned derived tables
- RLS ownership policies
- unique current-result constraints
- finalization function ownership checks
- deterministic input hashing
- language/theme exclusions from canonical hash
- stale trigger rules
- recompute service preserves prior valid result on failure
- API ignores client user IDs
- Action History transition contract
- Career Plan progress derives from Action History
- no generative AI, live job matching, salary or Phase 3G UI work

Validation commands must include:

- `pnpm typecheck`
- `pnpm run test:regression`
- `pnpm run lint`
- `pnpm run build`
- `git diff --check`

Authenticated QA remains manual until the migration is applied in the connected Supabase project.
