# Employment Action UI

`EmploymentActionCard` presents Phase 3E/3F action results.

Supported presentation states:

- ready;
- blocked;
- completed;
- skipped;
- stale;
- updating;
- error;
- unavailable.

Transitions call `/api/employment-intelligence` with `operation: "action_transition"`. The server derives the authenticated user and records Action History.

The CTA route comes from the persisted action destination or the central action registry fallback.
