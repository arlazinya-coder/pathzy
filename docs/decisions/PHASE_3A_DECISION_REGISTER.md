# Phase 3A Decision Register

Status: Locked for Phase 3B planning
Date: 2026-08-04

## Decisions

1. Employment Intelligence Profile is the single derived intelligence output.
   - Rejected: dashboard-specific readiness objects and per-consumer intelligence.
   - Reason: consumers must not independently recalculate intelligence.
   - Lock status: Locked.

2. Professional Identity remains the canonical fact source.
   - Rejected: uploaded CV or job-specific documents as source of truth.
   - Reason: identity must be stable across documents, matching, and applications.
   - Lock status: Locked.

3. Employment Diagnosis remains a separate diagnostic source.
   - Rejected: diagnosis answers overwriting Professional Identity.
   - Reason: circumstances and support needs are not the same as identity facts.
   - Lock status: Locked.

4. Readiness is multidimensional.
   - Rejected: one employability score.
   - Reason: readiness differs across identity, evidence, documents, access, eligibility, applications, interviews, and support.
   - Lock status: Locked.

5. Overall scoring is secondary and explainable.
   - Rejected: unexplained percentage as the main result.
   - Reason: users need evidence, gaps, uncertainty, and next steps.
   - Lock status: Locked.

6. Evidence provenance is mandatory.
   - Rejected: unsupported claims treated as verified.
   - Reason: PATHZY must preserve truthful user control.
   - Lock status: Locked.

7. Barriers distinguish user-controlled and external factors.
   - Rejected: blaming users for structural barriers.
   - Reason: practical support depends on correctly classifying the source of a barrier.
   - Lock status: Locked.

8. Pathways support all employment levels.
   - Rejected: graduate-only or office-professional-only intelligence.
   - Reason: PATHZY must serve diverse employment journeys with one adaptable engine.
   - Lock status: Locked.

9. South Africa is the first country adapter specification.
   - Rejected: hard-coded live South African facts in Phase 3A.
   - Reason: facts require source metadata, versions, confidence, and update policy.
   - Lock status: Locked.

10. Deterministic rules precede generative AI.
    - Rejected: prompt-only architecture.
    - Reason: high-impact guidance needs structured validation and explainability.
    - Lock status: Locked.

11. Canonical codes are language-independent.
    - Rejected: storing English or French labels as canonical values.
    - Reason: language switching must not alter intelligence.
    - Lock status: Locked.

12. Career Plan replaces Roadmap as primary user-facing term.
    - Rejected: continuing Roadmap as the main Phase 3 label.
    - Reason: Career Plan is clearer and less technical.
    - Lock status: Locked.

13. One primary next action and maximum three secondary actions.
    - Rejected: overwhelming users with long task lists.
    - Reason: support intensity must be practical and actionable.
    - Lock status: Locked.

14. Intelligence consumers do not independently recalculate.
    - Rejected: Home, Coach, documents, jobs, and applications calculating their own readiness.
    - Reason: duplicate logic causes drift.
    - Lock status: Locked.

15. No employer hiring decisions and no automatic applications.
    - Rejected: automated high-impact decisions or silent auto-apply.
    - Reason: users remain in control.
    - Lock status: Locked.
