# Action Priority Model

Priority scoring is deterministic and documented in `action-priority.ts`.

Weights include:

- urgency
- expected impact
- effort
- support intensity
- matching barrier/pathway/diagnosis/missing-information signals
- dependency blockers
- completed-action penalty

The score is internal. User-facing output receives reasons, impact, effort, blockers and completion criteria rather than unexplained numbers.

Immediate-income evidence can reorder actions, but it must preserve the long-term Career Plan and never lower human value or capability.
