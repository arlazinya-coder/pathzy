# Employment Intelligence API

Route: `app/api/employment-intelligence/route.ts`.

GET:

- summary by default
- detailed response with `?detail=true`

POST operations:

- `recompute`
- `retry`
- `mark_stale`
- `action_transition`

Rules:

- authentication required
- client user ID ignored
- stable response version `3F.1`
- safe error shape
- no raw SQL errors, stack traces, raw sensitive diagnosis answers or chain-of-thought
- no UI-specific recalculation
