# Next-Best-Action Model

Status: Phase 3A contract
Code: `lib/employment-intelligence/domain/next-best-action.ts`

## Contract

The engine returns exactly one primary action and up to three secondary actions.

Each action includes:
- action code
- title
- plain-language explanation
- reason
- urgency
- expected impact
- estimated effort
- prerequisites
- blockers
- destination
- supporting evidence
- confidence
- completion criteria
- source engine version

## Rules

- Completed actions are not recommended again.
- Dependencies are respected.
- Urgent income needs may reorder priorities.
- Work-authorisation blockers may cap certain recommendations.
- Recommendations must be actionable, not vague.
