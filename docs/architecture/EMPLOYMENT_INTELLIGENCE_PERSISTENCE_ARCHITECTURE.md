# Employment Intelligence Persistence Architecture

Flow:

Authenticated API -> Employment Intelligence Application Service -> Domain Engines -> Repositories -> Supabase tables.

The API authenticates with Supabase and ignores client-supplied user IDs. Repositories apply `user_id` filters on every operation and contain no scoring logic.

The recomputation orchestrator:

1. Loads Professional Identity through the existing read model.
2. Loads Employment Diagnosis from diagnosis-marked compatibility rows.
3. Resolves country context.
4. Builds a canonical input hash.
5. Runs the deterministic Employment Intelligence engine.
6. Persists draft intelligence, action recommendation and Career Plan records.
7. Finalizes them through `finalize_employment_intelligence_current`.
8. Preserves the previous current result on failure.
