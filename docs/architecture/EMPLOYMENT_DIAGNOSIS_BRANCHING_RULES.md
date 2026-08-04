# Employment Diagnosis Branching Rules

Branching is deterministic and implemented in:

- `branching-rules.ts`
- `adaptive-question-engine.ts`

Priority order:

1. Safety or legal workflow dependency.
2. Required information for meaningful assessment.
3. High-impact employment barrier.
4. Immediate income urgency.
5. Work eligibility uncertainty.
6. Practical access constraints.
7. Missing job-search evidence.
8. Pathway selection.
9. Support intensity.
10. Optional refinement.

Known Professional Identity facts are not asked again. Optional questions are deferred until high-value diagnostic areas have enough information.

Unknown, declined, skipped, and not-applicable answers remain separate states.
