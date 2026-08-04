# Employment Diagnosis Identity Suggestions

Diagnosis can propose Professional Identity updates, but it cannot apply them automatically.

Suggestion fields:

- suggestion ID
- target Professional Identity field
- proposed canonical value
- reason
- source diagnosis answer
- confidence
- user-facing explanation
- status
- source = `EMPLOYMENT_DIAGNOSIS`

Statuses:

- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `EXPIRED`

Acceptance must use the canonical Professional Identity write service in a later confirmed flow.
